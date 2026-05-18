import { useEffect, useState } from 'react'

const DEFAULT_LOCATION = { lat: 37.5665, lng: 126.978 }

/**
 * 사용자의 현재 위치를 가져오는 커스텀 훅
 * 위치 권한 거부 시 서울 중심 기본 좌표 반환
 * @returns {{ location: { lat: number, lng: number }, isLocating: boolean, isDefault: boolean }}
 */
export const useCurrentLocation = () => {
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [isLocating, setIsLocating] = useState(true)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsDefault(true)
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsDefault(false)
        setIsLocating(false)
      },
      () => {
        // 권한 거부 또는 오류 시 기본 좌표 사용
        setLocation(DEFAULT_LOCATION)
        setIsDefault(true)
        setIsLocating(false)
      },
      { timeout: 5000 }
    )
  }, [])

  return { location, isLocating, isDefault }
}
