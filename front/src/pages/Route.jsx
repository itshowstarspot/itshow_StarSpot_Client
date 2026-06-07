import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { fetchPlaceDetail, searchPlacesByKakao } from '../services/placeService'

/* ── 스타일 ── */
const Page = styled.main`
  width: 100vw; height: 100vh;
  display: flex; flex-direction: column;
  background: #f5f5f8;
`
const TopBar = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  z-index: 100;
`
const BackBtn = styled.button`
  border: none; background: transparent;
  color: #e8d664; font-size: 20px; cursor: pointer; padding: 4px;
`
const Title = styled.h1` font-size: 16px; font-weight: 700; color: #2d2f36; `

const RoutePanel = styled.div`
  background: #fff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
`

const RouteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const DotCol = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0;
`
const Dot = styled.div`
  width: 10px; height: 10px; border-radius: 50%;
  background: ${({ $color }) => $color || '#e8d664'};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px ${({ $color }) => $color || '#e8d664'};
`
const DotLine = styled.div`
  width: 2px; height: 18px; background: rgba(45,47,54,0.15);
`

/* 입력창 래퍼 (드롭다운 포함) */
const InputWrap = styled.div`
  flex: 1; position: relative;
`

const StyledInput = styled.input`
  width: 100%; height: 42px;
  border: 1.5px solid ${({ $focused }) => $focused ? '#e8d664' : 'rgba(45,47,54,0.12)'};
  border-radius: 10px;
  padding: 0 36px 0 12px;
  font-size: 14px; color: #2d2f36;
  outline: none; background: #f5f5f8;
  box-sizing: border-box;
  transition: border-color 0.15s;
  &::placeholder { color: rgba(45,47,54,0.35); }
`

const ClearBtn = styled.button`
  position: absolute; right: 8px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  color: rgba(45,47,54,0.3); font-size: 14px; cursor: pointer;
  padding: 4px;
  &:hover { color: #2d2f36; }
`

const MyLocBtn = styled.button`
  height: 42px; padding: 0 12px;
  border: 1.5px solid rgba(45,47,54,0.12);
  border-radius: 10px;
  background: #fff; color: #4285F4;
  font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: #f0f4ff; }
`

/* 자동완성 드롭다운 */
const Dropdown = styled.ul`
  position: absolute;
  top: calc(100% + 4px); left: 0; right: 0;
  background: #fff;
  border: 1.5px solid #e8d664;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  list-style: none;
  margin: 0; padding: 4px 0;
  z-index: 200;
  max-height: 200px;
  overflow-y: auto;
`

const DropItem = styled.li`
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(232,214,100,0.1); }
`
const DropName = styled.div` font-size: 13px; font-weight: 600; color: #2d2f36; `
const DropAddr = styled.div` font-size: 11px; color: rgba(45,47,54,0.45); margin-top: 2px; `

const SearchBtn = styled.button`
  height: 42px; padding: 0 18px;
  background: #e8d664; border: none;
  border-radius: 10px; color: #1a1a1a;
  font-size: 14px; font-weight: 700;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: #d4c250; }
  &:disabled { background: rgba(232,214,100,0.3); color: rgba(45,47,54,0.3); cursor: default; }
`

const TimeInfo = styled.div`
  padding: 10px 20px;
  background: rgba(232,214,100,0.1);
  font-size: 13px; color: #b8962a;
  border-bottom: 1px solid rgba(232,214,100,0.2);
`
const CalcError = styled.div`
  padding: 10px 20px;
  background: rgba(232,80,80,0.07);
  font-size: 13px; color: #e85050;
  border-bottom: 1px solid rgba(232,80,80,0.15);
`

const NavBtnRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid rgba(45,47,54,0.08);
`

const NavBtn = styled.a`
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: 1.5px solid ${({ $color }) => $color};
  background: #fff;
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
  &:hover { background: ${({ $bg }) => $bg}; }
`

const MapArea = styled.div` flex: 1; position: relative; `
const MapContainer = styled.div` width: 100%; height: 100%; `

/* ── 입력 + 자동완성 컴포넌트 ── */
function AutoInput({ value, onChange, onSelect, placeholder, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const timerRef = useRef(null)
  const wrapRef = useRef(null)

  const handleChange = (e) => {
    const v = e.target.value
    onChange(v)
    clearTimeout(timerRef.current)
    if (!v.trim()) { setSuggestions([]); return }
    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesByKakao(v)
        // placeService가 내부 Place 형태로 반환하므로 드롭다운에 맞게 변환
        setSuggestions(results.map((p) => ({
          id: p.id,
          place_name: p.name,
          road_address_name: p.address,
          address_name: p.address,
          y: p.lat,
          x: p.lng,
        })))
      } catch {
        setSuggestions([])
      }
    }, 350)
  }

  const handleSelect = (item) => {
    onSelect({ name: item.place_name, address: item.road_address_name || item.address_name, lat: parseFloat(item.y), lng: parseFloat(item.x) })
    setSuggestions([])
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setSuggestions([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <InputWrap ref={wrapRef}>
      <StyledInput
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        $focused={focused}
      />
      {value && (
        <ClearBtn type="button" onClick={() => { onChange(''); setSuggestions([]) }}>✕</ClearBtn>
      )}
      {suggestions.length > 0 && (
        <Dropdown>
          {suggestions.map((item) => (
            <DropItem key={item.id} onMouseDown={() => handleSelect(item)}>
              <DropName>{item.place_name}</DropName>
              <DropAddr>{item.road_address_name || item.address_name}</DropAddr>
            </DropItem>
          ))}
        </Dropdown>
      )}
      {rightSlot}
    </InputWrap>
  )
}

const MY_LOCATION_LABEL = '현재 위치'

/* ── 메인 컴포넌트 ── */
export default function Route() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const placeId = searchParams.get('placeId')

  const { location, isDefault, isLocating } = useCurrentLocation()
  const { containerRef: mapRef, error } = useKakaoMap({ center: location, level: 4 })

  const [originText, setOriginText] = useState('')
  const [originCoord, setOriginCoord] = useState(null)
  const [destText, setDestText] = useState('')
  const [destCoord, setDestCoord] = useState(null)
  // travelTime: 경로 탐색 API 연동 후 사용 예정 (현재 미사용)
  const [travelTime] = useState(null)
  const [calcError, setCalcError] = useState(null)

  // 현재 위치 → 출발지 자동 설정
  useEffect(() => {
    if (isLocating) return
    if (!isDefault && location) {
      setOriginText(MY_LOCATION_LABEL)
      setOriginCoord(location)
    } else {
      setOriginText('')
      setOriginCoord(null)
    }
  }, [isLocating, isDefault, location])

  // placeId → 목적지 자동 설정
  useEffect(() => {
    if (!placeId) return
    fetchPlaceDetail(placeId)
      .then((place) => {
        setDestText(place.name)
        if (place.lat && place.lng) setDestCoord({ lat: place.lat, lng: place.lng })
      })
      .catch((err) => {
        console.warn('[Route] 목적지 장소 조회 실패:', err.message)
        setCalcError('목적지 정보를 불러오지 못했어요.')
      })
  }, [placeId])

  const handleUseMyLocation = () => {
    if (location) {
      setOriginText(MY_LOCATION_LABEL)
      setOriginCoord(location)
    }
  }

  const handleCalculate = useCallback(() => {
    if (!destText.trim()) { setCalcError('목적지를 입력해주세요.'); return }
    if (!originText.trim()) { setCalcError('출발지를 입력해주세요.'); return }
    setCalcError(null)
    // TODO: 실제 경로 탐색 API(카카오 Mobility 등) 연동 후 setTravelTime 호출
    // 현재는 외부 지도 앱 링크(kakaoUrl/naverUrl)로 대체
  }, [originText, destText])

  const kakaoUrl = useMemo(() => {
    if (!destText) return null
    if (originCoord && destCoord) {
      return `https://map.kakao.com/link/from/${encodeURIComponent(originText)},${originCoord.lat},${originCoord.lng}/to/${encodeURIComponent(destText)},${destCoord.lat},${destCoord.lng}`
    }
    if (destCoord) {
      return `https://map.kakao.com/link/to/${encodeURIComponent(destText)},${destCoord.lat},${destCoord.lng}`
    }
    return `https://map.kakao.com/link/search/${encodeURIComponent(destText)}`
  }, [destText, originText, originCoord, destCoord])

  const naverUrl = useMemo(() => {
    if (!destText) return null
    if (originCoord && destCoord) {
      return `https://map.naver.com/v5/directions/${originCoord.lng},${originCoord.lat},${encodeURIComponent(originText)},start/${destCoord.lng},${destCoord.lat},${encodeURIComponent(destText)},end/-/-/transit`
    }
    return `https://map.naver.com/v5/search/${encodeURIComponent(destText)}`
  }, [destText, originText, originCoord, destCoord])

  const canNav = !!(originText && destText)

  const isOriginMyLoc = originText === MY_LOCATION_LABEL

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <Title>길찾기</Title>
      </TopBar>

      <RoutePanel>
        {/* 출발지 */}
        <RouteRow>
          <DotCol>
            <Dot $color="#4285F4" />
            <DotLine />
          </DotCol>
          <AutoInput
            value={originText}
            onChange={(v) => { setOriginText(v); if (v !== MY_LOCATION_LABEL) setOriginCoord(null) }}
            onSelect={({ name, lat, lng }) => { setOriginText(name); setOriginCoord({ lat, lng }) }}
            placeholder={isLocating ? '위치 가져오는 중...' : '출발지를 입력하세요'}
          />
          {!isOriginMyLoc && (
            <MyLocBtn type="button" onClick={handleUseMyLocation} title="현재 위치 사용">
              📍 현위치
            </MyLocBtn>
          )}
        </RouteRow>

        {/* 목적지 */}
        <RouteRow>
          <DotCol>
            <Dot $color="#e8d664" />
          </DotCol>
          <AutoInput
            value={destText}
            onChange={(v) => { setDestText(v); setDestCoord(null) }}
            onSelect={({ name, lat, lng }) => { setDestText(name); setDestCoord({ lat, lng }) }}
            placeholder="목적지를 입력하세요"
          />
          <SearchBtn onClick={handleCalculate} disabled={!originText || !destText}>
            탐색
          </SearchBtn>
        </RouteRow>
      </RoutePanel>

      {/* 외부 지도 앱 연결 버튼 */}
      {canNav && (
        <NavBtnRow>
          <NavBtn
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            $color="#FFD700"
            $bg="rgba(255,215,0,0.08)"
          >
            🗺 카카오맵
          </NavBtn>
          <NavBtn
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            $color="#03C75A"
            $bg="rgba(3,199,90,0.08)"
          >
            🗺 네이버지도
          </NavBtn>
        </NavBtnRow>
      )}

      {travelTime && <TimeInfo>🕐 예상 이동 시간: {travelTime}</TimeInfo>}
      {calcError && <CalcError>⚠️ {calcError}</CalcError>}

      <MapArea>
        {error
          ? <EmptyState icon="🗺️" message={error} />
          : <MapContainer ref={mapRef} />
        }
      </MapArea>
    </Page>
  )
}
