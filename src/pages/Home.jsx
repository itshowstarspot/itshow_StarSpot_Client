import { useState, useMemo, useCallback, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "../components/sidebar/Sidebar";
import ActivePanel from "../components/sidebar/ActivePanel";
import MapView from "../components/layout/MapView";
import IdolSelectModal from "../components/IdolSelectModal";
import PlaceDetailModal from "../components/place/PlaceDetailModal";
import CourseDetailModal from "../components/sidebar/CourseDetailModal";
import { idols } from "../domain/idol/idol";
import { usePlaces } from "../hooks/usePlaces";
import { useCourse } from "../hooks/useCourse";
import { getPendingReview } from "../stores/reviewStore";
import { CATEGORIES } from "../constants/categories";
import axios from "axios";

const Page = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f8;
`;

const MapArea = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  @media (max-width: 768px) {
    display: block;
  }
`;

const FilterBar = styled.div`
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  gap: 6px;
  pointer-events: all;
`;

const FilterChip = styled.button`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid
    ${({ $active }) => ($active ? "#e8d664" : "rgba(45,47,54,0.15)")};
  background: ${({ $active }) => ($active ? "#e8d664" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "rgba(45,47,54,0.6)")};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.15s;
  white-space: nowrap;
`;

const PanelOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 190;
  }
`;

export default function Home({ selectedIdol, onIdolChange, skipIdolPrompt }) {
  const [activeNav, setActiveNav] = useState("search");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    () => getPendingReview()?.placeId ?? null,
  );
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ── 길찾기 상태 관리 ── */
  const [routeCoords, setRouteCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 초기값: 서울시청

  // 다른 탭으로 이동 시 그려져 있던 길찾기 경로 리셋
  useEffect(() => {
    if (activeNav !== "route") {
      setRouteCoords(null);
    }
  }, [activeNav]);

  const hasIdolInStorage = useMemo(() => {
    const savedUserStr = localStorage.getItem("user");
    if (!savedUserStr) return null;
    try {
      const userObj = JSON.parse(savedUserStr);
      const idolName =
        userObj.favorite_idol || userObj.favoriteIdol || userObj.favorite;
      if (idolName && idolName !== "선택 안 됨" && idolName !== "null")
        return idolName;
      return null;
    } catch {
      return null;
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(() => {
    const savedIdol = localStorage.getItem("selected_idol");
    if (savedIdol) return false;
    if (hasIdolInStorage) return false;
    return !skipIdolPrompt;
  });

  const currentIdolId = useMemo(() => {
    if (selectedIdol?.id) return selectedIdol.id;
    if (hasIdolInStorage) {
      const matched = idols.find(
        (i) => i.name === hasIdolInStorage || i.id === hasIdolInStorage,
      );
      return matched?.id || null;
    }
    return null;
  }, [selectedIdol, hasIdolInStorage]);

  const { filteredPlaces } = usePlaces(currentIdolId);
  const { removeCourse } = useCourse();

  useEffect(() => {
    if (hasIdolInStorage) {
      const matchedIdol = idols.find(
        (i) => i.name === hasIdolInStorage || i.id === hasIdolInStorage,
      );
      if (matchedIdol) {
        if (matchedIdol.id !== selectedIdol?.id) onIdolChange(matchedIdol);
        if (!localStorage.getItem("selected_idol")) {
          localStorage.setItem("selected_idol", JSON.stringify(matchedIdol));
        }
      }
    }
  }, [selectedIdol, onIdolChange, hasIdolInStorage]);

  const displayPlaces = useMemo(
    () =>
      categoryFilter
        ? filteredPlaces.filter((p) => p.category === categoryFilter)
        : filteredPlaces,
    [filteredPlaces, categoryFilter],
  );

  const handlePlaceClick = useCallback((id) => setSelectedPlaceId(id), []);
  const handleCourseOpen = useCallback(
    (course) => setSelectedCourse(course),
    [],
  );

  const handleIdolSelect = async (idol) => {
    onIdolChange(idol);
    setIsModalOpen(false);
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    const userObj = JSON.parse(savedUser);
    userObj.favorite_idol = idol.name;
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("selected_idol", JSON.stringify(idol));

    try {
      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;
      await axios.put(`http://localhost:5000/api/users/profile`, {
        userId,
        email: userEmail,
        favorite_idol: idol.name,
      });
    } catch (err) {
      console.error("백엔드 업데이트 실패:", err);
    }
  };

  const hasAnyIdol =
    selectedIdol || localStorage.getItem("selected_idol") || hasIdolInStorage;
  const shouldOpenIdolModal = hasAnyIdol ? false : isModalOpen;

  return (
    <Page>
      {/* ─── 사이드바 영역 ─── */}
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
          onRouteSearch={setRouteCoords}
          mapCenter={mapCenter}
        />
      </Sidebar>

      {/* ─── 지도 영역 ─── */}
      <MapArea>
        <MapView
          places={displayPlaces}
          onPlaceClick={handlePlaceClick}
          routeCoords={routeCoords}
          onMapCenterChange={setMapCenter}
        />

        <FilterBar>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              $active={categoryFilter === cat}
              onClick={() =>
                setCategoryFilter(categoryFilter === cat ? null : cat)
              }
            >
              {cat}
            </FilterChip>
          ))}
        </FilterBar>
        <PanelToggleBtn onClick={() => setPanelOpen(true)}>
          📍 장소 목록
        </PanelToggleBtn>

        {selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}

        {selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onDelete={(id) => {
              removeCourse(id);
              setSelectedCourse(null);
            }}
          />
        )}
      </MapArea>

      <PanelOverlay $open={panelOpen} onClick={() => setPanelOpen(false)} />

      {shouldOpenIdolModal && (
        <IdolSelectModal
          isOpen={shouldOpenIdolModal}
          idols={idols}
          onSelect={handleIdolSelect}
        />
      )}
    </Page>
  );
}
