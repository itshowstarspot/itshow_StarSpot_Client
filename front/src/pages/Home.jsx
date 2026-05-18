import { useState, useEffect } from 'react'
import styled from 'styled-components'
import Sidebar from '../components/sidebar/Sidebar'
import SearchPanel from '../components/sidebar/SearchPanel'
import RoutePanel from '../components/sidebar/RoutePanel'
import CoursePanel from '../components/sidebar/CoursePanel'
import FavoritesPanel from '../components/sidebar/FavoritesPanel'
import MapView from '../components/layout/MapView'
import IdolSelectModal from '../components/IdolSelectModal'
import PlaceDetailModal from '../components/place/PlaceDetailModal'
import CourseDetailModal from '../components/sidebar/CourseDetailModal'
import { idols } from '../domain/idol/idol'
import { usePlaces } from '../hooks/usePlaces'
import { useCourse } from '../hooks/useCourse'

/* ── 전체 레이아웃 ── */
const Page = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f8;
`

/* ── 지도 영역: 나머지 공간 채움 ── */
const MapArea = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

/* ── 모바일에서 패널 토글 버튼 ── */
const PanelToggleBtn = styled.button`
  display: none;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  background: #e8d664;
  color: #1a1a1a;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);

  @media (max-width: 768px) { display: block; }
`

/* ── 모바일 패널 오버레이 배경 ── */
const PanelOverlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 190;
  }
`

function ActivePanel({ navId, selectedIdol, onPlaceClick, onCourseOpen }) {
  switch (navId) {
    case 'route':    return <RoutePanel />
    case 'favorite': return <FavoritesPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
    case 'course':   return <CoursePanel onCourseOpen={onCourseOpen} idolId={selectedIdol?.id} />
    default:         return <SearchPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
  }
}

/**
 * Home 페이지 — NavCol + PanelCol(패널 전환) + Map
 */
export default function Home({ selectedIdol, onIdolChange, started }) {
  const [activeNav, setActiveNav] = useState('search')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const { filteredPlaces } = usePlaces(selectedIdol?.id)
  const { removeCourse } = useCourse()

  useEffect(() => {
    if (started && !selectedIdol) setIsModalOpen(true)
  }, [started])

  const handleIdolSelect = (idol) => {
    onIdolChange(idol)
    setIsModalOpen(false)
  }

  return (
    <Page>
      {/* ─── 사이드바 ─── */}
      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        idolImage={selectedIdol?.profile}
        panelOpen={panelOpen}
      >
        <ActivePanel
          navId={activeNav}
          selectedIdol={selectedIdol}
          onPlaceClick={(id) => setSelectedPlaceId(id)}
          onCourseOpen={(course) => setSelectedCourse(course)}
        />
      </Sidebar>

      {/* ─── 지도 ─── */}
      <MapArea>
        <MapView places={filteredPlaces} onPlaceClick={(id) => setSelectedPlaceId(id)} />
        <PanelToggleBtn onClick={() => setPanelOpen(true)}>
          📍 장소 목록
        </PanelToggleBtn>

        {/* ─── 장소 상세 모달 ─── */}
        {selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}

        {/* ─── 코스 상세 모달 ─── */}
        {selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onDelete={(id) => { removeCourse(id); setSelectedCourse(null) }}
          />
        )}
      </MapArea>

      <PanelOverlay $open={panelOpen} onClick={() => setPanelOpen(false)} />

      {/* ─── 아이돌 선택 모달 ─── */}
      <IdolSelectModal
        isOpen={isModalOpen}
        idols={idols}
        onSelect={handleIdolSelect}
      />
    </Page>
  )
}
