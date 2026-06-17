import { useEffect, useState } from 'react'

const FIXED_LOCATION = { lat: 37.4664, lng: 126.9324 } 

export const useCurrentLocation = () => {
  const [location, setLocation] = useState(FIXED_LOCATION)
  const [isLocating, setIsLocating] = useState(false)
  const [isDefault, setIsDefault] = useState(true)

  const moveToFixedLocation = () => {
    console.log("내 위치 고정 클릭 -> 서울특별시 관악구 호암로 546");
    setLocation(FIXED_LOCATION)
  }

  useEffect(() => {
    setLocation(FIXED_LOCATION)
    setIsLocating(false)
    setIsDefault(true)
  }, [])

  return { location, isLocating, isDefault, moveToFixedLocation, setLocation }
}