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

const FloatingButtons = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`

const FloatBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(45,47,54,0.1);
  background: #ffffff;
  color: #2d2f36;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  font-size: 20px;
  font-weight: 300;
  transition: background 0.15s;
  &:hover { background: #f5f5f8; }
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

export default function MapView({ places = [], onPlaceClick }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  /* 지도 초기화 */
  useEffect(() => {
    loadKakaoMapSdk()
      .then(() => {
        if (!containerRef.current || mapRef.current) return
        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        })
        setIsReady(true)
      })
      .catch((err) => setError(err.message))
  }, [])

  /* 장소 마커 */
  useEffect(() => {
    if (!isReady || !mapRef.current) return

    const map = mapRef.current
    const kakao = window.kakao.maps

    markersRef.current.forEach((m) => m.setMap && m.setMap(null))
    markersRef.current = []

    places.forEach((place) => {
      if (!place.lat || !place.lng) return

      const position = new kakao.LatLng(place.lat, place.lng)

      const el = document.createElement('div')
      el.style.cssText = `
        width:14px;height:14px;
        background:#e8d664;
        border:2.5px solid #b8962a;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        cursor:pointer;
      `
      el.addEventListener('click', () => onPlaceClick?.(place.id))

      const overlay = new kakao.CustomOverlay({ position, content: el, yAnchor: 0.5 })
      overlay.setMap(map)
      markersRef.current.push(overlay)
    })
  }, [isReady, places])

  const handleZoomIn  = () => { const m = mapRef.current; if (m) m.setLevel(m.getLevel() - 1) }
  const handleZoomOut = () => { const m = mapRef.current; if (m) m.setLevel(m.getLevel() + 1) }
  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(coords.latitude, coords.longitude))
    })
  }

  return (
    <MapWrap>
      <MapContainer ref={containerRef} />

      {error && <ErrorMsg><span>🗺</span><span>{error}</span></ErrorMsg>}

      <FloatingButtons>
        <FloatBtn onClick={handleZoomIn}>＋</FloatBtn>
        <FloatBtn style={{ color: '#e8d664', fontSize: 22 }}>★</FloatBtn>
      </FloatingButtons>
    </MapWrap>
  )
}
