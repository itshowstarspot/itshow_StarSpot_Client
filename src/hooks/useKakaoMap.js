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
        if (!containerRef.current || mapRef.current) return

        const mapInstance = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level,
          clickable: true 
        })
        
        mapRef.current = mapInstance
        setIsReady(true)
      } catch (err) {
        setError(err.message)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!mapRef.current || !window.kakao) return
    const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng)
    mapRef.current.setCenter(moveLatLon)
  }, [center.lat, center.lng])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setLevel(level)
  }, [level])

  return { containerRef, mapRef, map: mapRef.current, isReady, error }
}