import { useEffect, useRef, useState } from 'react'
import './Select.css'

import searchIcon from '../assets/search.png'
import locationPinIcon from '../assets/icon/location pin.png'
import locationIcon from '../assets/icon/location.png'
import mapIcon from '../assets/icon/map.png'
import starIcon from '../assets/icon/star.png'
import yellowStar from '../assets/logo/yellow-star.png'
import bangJeemin from '../assets/person/bangjeemin.png'
import day6Logo from '../assets/person/day6.png'
import jungKook from '../assets/person/jungkook.png'
import karina from '../assets/person/karina.png'
import leeYoungji from '../assets/person/leeyoungji.png'

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk'
const KAKAO_MAP_KEY =
  import.meta.env.VITE_KAKAO_MAP_APP_KEY ||
  import.meta.env.VITE_KAKAO_MAP_KEY ||
  '886fa58730924d11e9929f7fc028301b'

const idols = [
  {
    id: 'jungkook',
    groupLabel: 'BTS',
    name: 'JUNG KOOK',
    image: jungKook,
  },
  {
    id: 'bangjeemin',
    groupLabel: 'izna',
    name: 'BANG JEEMIN',
    image: bangJeemin,
  },
  {
    id: 'karina',
    groupLabel: 'aespa',
    name: 'KARINA',
    image: karina,
  },
  {
    id: 'youngk',
    groupLabel: 'DAY6',
    name: 'YOUNG K',
    image: day6Logo,
  },
  {
    id: 'leeyoungji',
    groupLabel: 'Lee Youngji',
    name: 'LEE YOUNGJI',
    image: leeYoungji,
  },
]

function Select({ onSelect }) {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!KAKAO_MAP_KEY || !mapRef.current) {
      return
    }

    const createMap = () => {
      try {
        window.kakao.maps.load(() => {
          const center = new window.kakao.maps.LatLng(37.555946, 126.972317)
          const map = new window.kakao.maps.Map(mapRef.current, {
            center,
            level: 4,
          })

          map.setDraggable(false)
          map.setZoomable(false)
          setMapReady(true)
          setMapError(false)
        })
      } catch {
        setMapError(true)
      }
    }
    const handleScriptError = () => setMapError(true)

    if (window.kakao?.maps) {
      createMap()
      return
    }

    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', createMap, { once: true })
      existingScript.addEventListener('error', handleScriptError, { once: true })
      return () => {
        existingScript.removeEventListener('load', createMap)
        existingScript.removeEventListener('error', handleScriptError)
      }
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAP_SCRIPT_ID
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`
    script.async = true
    script.addEventListener('load', createMap, { once: true })
    script.addEventListener('error', handleScriptError, { once: true })
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', createMap)
      script.removeEventListener('error', handleScriptError)
    }
  }, [])

  return (
    <main className="select-page" aria-label="Select idol">
      <div className="select-map" ref={mapRef} aria-hidden="true" />
      {!KAKAO_MAP_KEY && (
        <p className="select-map-message">
          Kakao Map API key is missing. Add VITE_KAKAO_MAP_APP_KEY to .env.
        </p>
      )}
      {KAKAO_MAP_KEY && !mapReady && !mapError && <div className="select-map-loading" />}
      {mapError && (
        <p className="select-map-message">
          Kakao Map failed to load. Check the JavaScript app key and allowed domain.
        </p>
      )}

      <aside className="select-sidebar" aria-hidden="true">
        <img className="select-sidebar-logo" src={yellowStar} alt="" />
        <div className="select-nav">
          <img className="select-nav-icon" src={locationIcon} alt="" />
          <strong>정보 검색</strong>
        </div>
        <div className="select-nav">
          <img className="select-nav-icon" src={locationPinIcon} alt="" />
          <strong>길찾기</strong>
        </div>
        <div className="select-nav">
          <img className="select-nav-icon" src={starIcon} alt="" />
          <strong>즐겨찾기</strong>
        </div>
        <div className="select-nav">
          <img className="select-nav-icon" src={mapIcon} alt="" />
          <strong>등록한 코스</strong>
        </div>
        <div className="select-profile" />
      </aside>

      <section className="select-list-panel" aria-hidden="true">
        <label className="select-search">
          <span>
            <img src={searchIcon} alt="" />
          </span>
          <input placeholder="가고 싶은 장소를 입력하세요..." />
        </label>
        <div className="select-filter-row">
          <button type="button">관련도순</button>
          <button type="button">거리순</button>
        </div>
        <h2>최애 추천 맛집</h2>
        <article className="select-place-card">
          <div className="place-image first" />
          <p>사장님이 맛있고 음식이 친절해요</p>
          <h3>
            식당 이름 <span>더보기</span>
          </h3>
        </article>
        <article className="select-place-card">
          <div className="place-image second" />
          <p>얼마나 맛있는지 감도 안 오는 음식</p>
          <h3>
            식당 이름 <span>더보기</span>
          </h3>
        </article>
      </section>

      <div className="select-map-control plus" aria-hidden="true" />
      <div className="select-map-control favorite" aria-hidden="true" />

      <section className="idol-modal">
        <div className="idol-modal-inner">
          <h1>
            따라가고 싶은 <strong>아이돌</strong> 선택!
            <img src={yellowStar} alt="" />
          </h1>
          <div className="idol-grid">
            {idols.map((idol) => (
              <button
                className="idol-card"
                key={idol.id}
                type="button"
                onClick={() => onSelect?.(idol)}
              >
                <img
                  className="idol-card-image"
                  src={idol.image}
                  alt={`${idol.groupLabel} ${idol.name}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Select
