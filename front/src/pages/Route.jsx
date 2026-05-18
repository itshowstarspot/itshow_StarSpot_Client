import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { fetchPlaceDetail } from '../services/placeService'

const Page = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f8;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  z-index: 100;
`

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
`

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
`

const InfoPanel = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  align-items: center;
`

const InputField = styled.input`
  flex: 1;
  background: #f5f5f8;
  border: 1px solid rgba(45,47,54,0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: #2d2f36;
  font-size: 14px;
  outline: none;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.35); }
`

const TimeInfo = styled.div`
  padding: 10px 20px;
  background: rgba(232,214,100,0.1);
  font-size: 13px;
  color: #b8962a;
  border-bottom: 1px solid rgba(232,214,100,0.2);
`

const MapArea = styled.div`
  flex: 1;
  position: relative;
`

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`

const RetryBtn = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`

/**
 * 길찾기 페이지
 */
export default function Route() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const placeId = searchParams.get('placeId')

  const { location, isDefault } = useCurrentLocation()
  const { mapRef, isReady, error } = useKakaoMap({ center: location, level: 4 })

  const [destination, setDestination] = useState('')
  const [origin, setOrigin] = useState('')
  const [travelTime, setTravelTime] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcError, setCalcError] = useState(null)

  useEffect(() => {
    if (!placeId) return
    fetchPlaceDetail(placeId)
      .then((place) => setDestination(place.name))
      .catch(() => {})
  }, [placeId])

  useEffect(() => {
    if (isDefault) {
      setOrigin('현재 위치를 가져올 수 없어 서울 중심으로 설정했어요.')
    }
  }, [isDefault])

  const handleCalculate = async () => {
    if (!destination.trim()) {
      setCalcError('목적지를 입력해주세요.')
      return
    }
    setIsCalculating(true)
    setCalcError(null)
    // 실제 API 연동 전 임시 처리
    await new Promise((r) => setTimeout(r, 1000))
    setTravelTime('약 24분 (1.8km)')
    setIsCalculating(false)
  }

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <Title>길찾기</Title>
      </TopBar>

      <InfoPanel>
        <InputField
          placeholder={isDefault ? '현재 위치 사용 불가 - 출발지 직접 입력' : '출발지 (현재 위치)'}
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <span style={{ color: 'rgba(45,47,54,0.35)' }}>→</span>
        <InputField
          placeholder="목적지"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Button size="sm" onClick={handleCalculate} disabled={isCalculating}>
          {isCalculating ? '탐색 중...' : '탐색'}
        </Button>
      </InfoPanel>

      {travelTime && (
        <TimeInfo>🕐 예상 이동 시간: {travelTime}</TimeInfo>
      )}
      {calcError && (
        <TimeInfo style={{ color: '#e85050', background: 'rgba(232,80,80,0.07)', borderBottomColor: 'rgba(232,80,80,0.15)' }}>
          ⚠️ {calcError}
        </TimeInfo>
      )}

      <MapArea>
        {isCalculating && <LoadingSpinner padding="30%" />}
        {error ? (
          <EmptyState icon="🗺️" message={error} />
        ) : (
          <MapContainer ref={mapRef} />
        )}
        <RetryBtn>
          <Button variant="secondary" size="sm" onClick={handleCalculate}>
            다시 탐색
          </Button>
        </RetryBtn>
      </MapArea>
    </Page>
  )
}
