import { useState, useMemo, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { fetchPlaceDetail } from "../services/placeService";
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
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 190;
  }
`;

export default function Home({ selectedIdol, onIdolChange, skipIdolPrompt }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("search");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    () => getPendingReview()?.placeId ?? null,
  );
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ── 길찾기 및 위치 상태 관리 ── */
  const [myLocation, setMyLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);

  /* ── ⭕ [수정 완료] 외부 링크 및 내부 길찾기 전환 파이프라인 정비 ── */
  useEffect(() => {
    const mode = searchParams.get("mode");
    const placeId = searchParams.get("placeId");

    // placeId가 없거나 문자열 "undefined" 이면 작동 자체를 차단
    if (!placeId || placeId === "undefined" || String(placeId).trim() === "") {
      return;
    }

    if (mode === "route") {
      setActiveNav("route");

      fetchPlaceDetail(placeId)
        .then((place) => {
          if (place) {
            const finalLat = Number(place.lat || place.latitude);
            const finalLng = Number(place.lng || place.longitude);
            const finalName = place.name || place.placeName || "선택된 장소";

            // 백엔드 명세에 맞춘 안전한 ID 검증 프로퍼티 오버로딩
            const parsedId =
              place.id || place._id || place.spotId || place.placeId || placeId;

            if (!isNaN(finalLat) && !isNaN(finalLng)) {
              const destinationData = {
                lat: finalLat,
                lng: finalLng,
                name: finalName,
                isDirectTrigger: true,
              };

              setRouteCoords(destinationData);
              setMapCenter({ lat: finalLat, lng: finalLng });

              // 🛡️ 최종 추출된 ID가 "undefined" 문자열이 아닐 때만 스테이트 주입
              if (parsedId && String(parsedId) !== "undefined") {
                setSelectedPlaceId(String(parsedId));
              }
            }
          }
        })
        .catch((err) =>
          console.error("❌ 홈페이지 길찾기 데이터 빌드 실패:", err),
        );
    }
  }, [searchParams]);

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

  // ⭕ [수정] undefined 문자열 및 다양한 ID 프로퍼티 대응 방어 코드
  const handlePlaceClick = useCallback(
    (placeOrId) => {
      if (!placeOrId) return;

      let id = "";
      // 1. 인자가 객체로 넘어왔을 경우 (place)
      if (typeof placeOrId === "object") {
        id =
          placeOrId.id ||
          placeOrId.spotId ||
          placeOrId._id ||
          placeOrId.placeId;
      } else {
        // 2. 인자가 ID 값 단독으로 넘어왔을 경우
        id = placeOrId;
      }

      // 'undefined' 문자열이거나 값이 유효하지 않다면 라우팅 차단
      if (id && String(id) !== "undefined" && String(id).trim() !== "") {
        navigate(`/place/${id}`);
      } else {
        console.error(
          "❌ 유효하지 않은 장소 ID가 포착되어 이동을 차단했습니다:",
          placeOrId,
        );
      }
    },
    [navigate],
  );

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
          myLocation={myLocation}
          routeCoords={routeCoords}
        />
      </Sidebar>

      <MapArea>
        <MapView
          places={displayPlaces}
          onPlaceClick={handlePlaceClick}
          routeCoords={routeCoords}
          onMapCenterChange={setMapCenter}
          onMyLocationChange={setMyLocation}
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

        {selectedPlaceId && selectedPlaceId !== "undefined" && (
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
