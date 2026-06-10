import { useEffect, useRef, useState } from 'react'
import { loadKakaoMapSdk } from '../services/kakaoMap'

export const useKakaoMap = ({
  center = { lat: 37.5665, lng: 126.978 },
  level = 5,
} = {}) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        await loadKakaoMapSdk()

        if (!containerRef.current) return

        // 이미 같은 컨테이너에 맵이 초기화된 경우 재사용
        if (mapRef.current) {
          setIsReady(true)
          return
        }

        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level,
        })

        setIsReady(true)
      } catch (err) {
        setError(err.message)
      }
    }

    init()
  }, [])

  return { containerRef, mapRef, isReady, error }
}
