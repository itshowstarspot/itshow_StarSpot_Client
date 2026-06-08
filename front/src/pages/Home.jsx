import { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import Sidebar from '../components/sidebar/Sidebar'
import ActivePanel from '../components/sidebar/ActivePanel'
import MapView from '../components/layout/MapView'
import IdolSelectModal from '../components/IdolSelectModal'
import PlaceDetailModal from '../components/place/PlaceDetailModal'
import CourseDetailModal from '../components/sidebar/CourseDetailModal'
import { idols } from '../domain/idol/idol'
import { usePlaces } from '../hooks/usePlaces'
import { useCourse } from '../hooks/useCourse'
import { getPendingReview } from '../stores/reviewStore'
import { CATEGORIES } from '../constants/categories'

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
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);

  @media (max-width: 768px) { display: block; }
`

const FilterBar = styled.div`
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  gap: 6px;
  pointer-events: all;
`

const FilterChip = styled.button`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid ${({ $active }) => ($active ? '#e8d664' : 'rgba(45,47,54,0.15)')};
  background: ${({ $active }) => ($active ? '#e8d664' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(45,47,54,0.6)')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.15s;
  white-space: nowrap;
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

/**
 * Home 페이지 — NavCol + PanelCol(패널 전환) + Map
 */
export default function Home({ selectedIdol, onIdolChange, skipIdolPrompt }) {
  const [activeNav, setActiveNav] = useState('search')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState(() => getPendingReview()?.placeId ?? null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const { filteredPlaces } = usePlaces(selectedIdol?.id)
  const { removeCourse } = useCourse()

  const displayPlaces = useMemo(
    () => categoryFilter ? filteredPlaces.filter((p) => p.category === categoryFilter) : filteredPlaces,
    [filteredPlaces, categoryFilter]
  )
  const shouldOpenIdolModal = isModalOpen || (!skipIdolPrompt && !selectedIdol)

  // useCallback으로 안정화 — MapView의 마커 useEffect deps에 포함되므로
  // 인라인 화살표 함수이면 매 렌더마다 마커 전체 재생성됨
  const handlePlaceClick = useCallback((id) => setSelectedPlaceId(id), [])
  const handleCourseOpen = useCallback((course) => setSelectedCourse(course), [])

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
          onPlaceClick={handlePlaceClick}
          onCourseOpen={handleCourseOpen}
        />
      </Sidebar>

      {/* ─── 지도 ─── */}
      <MapArea>
        <MapView places={displayPlaces} onPlaceClick={handlePlaceClick} />
        <FilterBar>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              $active={categoryFilter === cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            >
              {cat}
            </FilterChip>
          ))}
        </FilterBar>
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
        isOpen={shouldOpenIdolModal}
        idols={idols}
        onSelect={handleIdolSelect}
      />
    </Page>
  )
}
