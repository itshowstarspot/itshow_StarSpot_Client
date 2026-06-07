import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadKakaoMapSdk } from '../../services/kakaoMap'

const MapWrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
`

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`

const ErrorMsg = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(45,47,54,0.5);
  font-size: 14px;
  gap: 8px;
  background: #f5f5f8;
`

/** 카테고리별 핀 색상 */
const CATEGORY_COLOR = {
  카페:   { bg: '#e8d664', border: '#b8962a', text: '#7a6210' },
  음식점: { bg: '#ff8c66', border: '#c45c36', text: '#fff' },
  관광지: { bg: '#66b8ff', border: '#3680c4', text: '#fff' },
  기타:   { bg: '#b08cff', border: '#7050c0', text: '#fff' },
}

function getColor(category) {
  return CATEGORY_COLOR[category] ?? CATEGORY_COLOR['기타']
}

/** 핀 HTML 생성 */
function createPinEl(place, onClick) {
  const { bg, border, text } = getColor(place.category)

  const wrap = document.createElement('div')
  wrap.style.cssText = `
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
  `

  // 라벨
  const label = document.createElement('div')
  label.textContent = place.name
  label.style.cssText = `
    max-width: 100px;
    padding: 4px 8px;
    border-radius: 999px;
    background: ${bg};
    border: 1.5px solid ${border};
    color: ${text};
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    margin-bottom: 2px;
  `

  // 핀 꼬리 (삼각형)
  const tail = document.createElement('div')
  tail.style.cssText = `
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid ${border};
  `

  wrap.appendChild(label)
  wrap.appendChild(tail)
  wrap.addEventListener('click', () => onClick(place))

  return wrap
}

/** 현재 위치 마커 */
function createMyLocationEl() {
  const wrap = document.createElement('div')
  wrap.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  const outer = document.createElement('div')
  outer.style.cssText = `
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(66, 133, 244, 0.2);
    display: flex; align-items: center; justify-content: center;
  `

  const inner = document.createElement('div')
  inner.style.cssText = `
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #4285F4;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(66,133,244,0.5);
  `

  outer.appendChild(inner)
  wrap.appendChild(outer)
  return wrap
}

export default function MapView({ places = [], onPlaceClick }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const myLocationRef = useRef(null)
  const infoOverlayRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  /* 지도 초기화 */
  useEffect(() => {
    let watchId = null

    loadKakaoMapSdk()
      .then(() => {
        if (!containerRef.current || mapRef.current) return
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        })
        setIsReady(true)

        if (!navigator.geolocation) return

        let isCentered = false
        let bestAccuracy = Infinity  // 가장 정확한 수신값 추적

        watchId = navigator.geolocation.watchPosition(
          ({ coords }) => {
            const { latitude, longitude, accuracy } = coords

            // 정확도 50m 초과 시 무시 (WiFi/기지국 기반 오차 제거)
            // 단, 첫 수신은 200m 이하면 허용 (빠른 초기 표시)
            const threshold = isCentered ? 50 : 200
            if (accuracy > threshold) return

            // 이전보다 나쁜 정확도는 무시
            if (accuracy > bestAccuracy) return
            bestAccuracy = accuracy

            const pos = new window.kakao.maps.LatLng(latitude, longitude)

            // 파란 점 위치 갱신
            if (myLocationRef.current) {
              myLocationRef.current.setPosition(pos)
            } else {
              const el = createMyLocationEl()
              const overlay = new window.kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 0.5 })
              overlay.setMap(mapRef.current)
              myLocationRef.current = overlay
            }

            // 처음 위치 받을 때만 지도 중심 이동
            if (!isCentered) {
              mapRef.current.setCenter(pos)
              isCentered = true
            }
          },
          (err) => {
            // 위치 권한 거부 또는 타임아웃 — 지도는 서울 기본 좌표로 유지
            console.warn('[MapView] 위치 정보를 가져올 수 없습니다:', err.message)
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        )
      })
      .catch((err) => setError(err.message))

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  /* 장소 핀 마커 */
  useEffect(() => {
    if (!isReady || !mapRef.current) return
    const map = mapRef.current
    const kakao = window.kakao.maps

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    // 기존 인포 오버레이 제거
    infoOverlayRef.current?.setMap(null)
    infoOverlayRef.current = null

    places.forEach((place) => {
      if (!place.lat || !place.lng) return

      const position = new kakao.LatLng(place.lat, place.lng)

      const handlePinClick = (clickedPlace) => {
        // 기존 인포 오버레이 닫기
        infoOverlayRef.current?.setMap(null)

        // 인포 팝업 생성
        const infoEl = document.createElement('div')
        infoEl.style.cssText = `
          background: #fff;
          border: 1.5px solid #e8d664;
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 140px;
          position: relative;
          cursor: pointer;
        `

        const nameEl = document.createElement('div')
        nameEl.textContent = clickedPlace.name
        nameEl.style.cssText = `font-size: 13px; font-weight: 700; color: #2d2f36;`

        const addrEl = document.createElement('div')
        addrEl.textContent = clickedPlace.address || ''
        addrEl.style.cssText = `font-size: 11px; color: rgba(45,47,54,0.5);`

        const closeEl = document.createElement('button')
        closeEl.textContent = '✕'
        closeEl.style.cssText = `
          position: absolute; top: 6px; right: 8px;
          background: none; border: none;
          font-size: 12px; color: rgba(45,47,54,0.4);
          cursor: pointer; padding: 0;
        `
        closeEl.addEventListener('click', (e) => {
          e.stopPropagation()
          infoOverlayRef.current?.setMap(null)
          infoOverlayRef.current = null
        })

        infoEl.appendChild(nameEl)
        if (clickedPlace.address) infoEl.appendChild(addrEl)
        infoEl.appendChild(closeEl)
        infoEl.addEventListener('click', () => onPlaceClick?.(clickedPlace.id))

        const infoOverlay = new kakao.CustomOverlay({
          position,
          content: infoEl,
          yAnchor: 1.6,
        })
        infoOverlay.setMap(map)
        infoOverlayRef.current = infoOverlay

        map.panTo(position)
      }

      const pinEl = createPinEl(place, handlePinClick)
      const overlay = new kakao.CustomOverlay({ position, content: pinEl, yAnchor: 1.0 })
      overlay.setMap(map)
      markersRef.current.push(overlay)
    })

    // 장소들이 모두 보이도록 지도 범위 조정
    if (places.length > 0 && places.some((p) => p.lat && p.lng)) {
      const bounds = new kakao.LatLngBounds()
      places.forEach((p) => { if (p.lat && p.lng) bounds.extend(new kakao.LatLng(p.lat, p.lng)) })
      map.setBounds(bounds)
    }
  // onPlaceClick을 deps에 포함시켜 stale closure 방지
  }, [isReady, places, onPlaceClick])

  return (
    <MapWrap>
      <MapContainer ref={containerRef} />
      {error && <ErrorMsg><span>🗺</span><span>{error}</span></ErrorMsg>}
    </MapWrap>
  )
}
