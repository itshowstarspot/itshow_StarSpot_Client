import { useEffect, useRef, useState } from 'react'
import './Start.css'

import mainLogo from '../assets/logo/main-logo.png'
import whiteStar from '../assets/logo/white-star.png'
import yellowStar from '../assets/logo/yellow-star.png'

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk'
const KAKAO_MAP_KEY =
  import.meta.env.VITE_KAKAO_MAP_APP_KEY || import.meta.env.VITE_KAKAO_MAP_KEY

function Start({ onStart }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!KAKAO_MAP_KEY || !mapRef.current) {
      return
    }

    const createMap = () => {
      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(37.555946, 126.972317)
        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 4,
        })

        map.setDraggable(false)
        map.setZoomable(false)
        setMapReady(true)
      })
    }

    if (window.kakao?.maps) {
      createMap()
      return
    }

    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', createMap, { once: true })
      return () => existingScript.removeEventListener('load', createMap)
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAP_SCRIPT_ID
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`
    script.async = true
    script.addEventListener('load', createMap, { once: true })
    document.head.appendChild(script)

    return () => script.removeEventListener('load', createMap)
  }, [])

  return (
    <main className="start-page" aria-label="Star Spot start screen">
      <div className="start-map" ref={mapRef} aria-hidden="true" />
      {!KAKAO_MAP_KEY && (
        <p className="start-map-message">
          Kakao Map API key is missing. Add VITE_KAKAO_MAP_APP_KEY to .env.
        </p>
      )}
      {KAKAO_MAP_KEY && !mapReady && <div className="start-map-loading" />}

      <section className="start-card">
        <img className="start-star start-star-large" src={yellowStar} alt="" />
        <img className="start-star start-star-soft" src={whiteStar} alt="" />

        <div className="start-brand">
          <img className="start-logo" src={mainLogo} alt="Star Spot" />
        </div>

        <button className="start-button" type="button" onClick={onStart}>
          시작하기
          <img className="start-button-star pale" src={whiteStar} alt="" />
          <img className="start-button-star gold" src={yellowStar} alt="" />
        </button>
      </section>
    </main>
  )
}

export default Start
