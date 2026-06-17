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

  const [myLocation, setMyLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [courseRoute, setCourseRoute] = useState(null);
  const [courseVersion, setCourseVersion] = useState(0);

  useEffect(() => {
    const courseId = searchParams.get("courseId");
    if (!courseId) return;
    axios
      .get(`/api/courses/${courseId}`)
      .then((res) => {
        const course = res.data?.data ?? res.data;
        if (course) {
          setSelectedCourse(course);
          setSearchParams({}, { replace: true });
        }
      })
      .catch((err) => console.error("❌ 공유 코스 로드 실패:", err));
  }, [searchParams]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    const placeId = searchParams.get("placeId");

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

            if (!isNaN(finalLat) && !isNaN(finalLng)) {
              const destinationData = {
                id: Date.now(),
                lat: finalLat,
                lng: finalLng,
                name: finalName,
                isDirectTrigger: true,
              };

              setRouteCoords(destinationData);
              setMapCenter({ lat: finalLat, lng: finalLng });
              setSearchParams({}, { replace: true });
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
    if (localStorage.getItem("selected_idol")) return false;
    if (hasIdolInStorage) return false;
    return !skipIdolPrompt;
  });

  const currentUserEmail = useMemo(() => {
    const savedUserStr = localStorage.getItem("user");
    if (!savedUserStr) return null;
    try {
      const userObj = JSON.parse(savedUserStr);
      return userObj.email || userObj.user_email || null;
    } catch {
      return null;
    }
  }, []);

  const currentIdolId = useMemo(() => {
    if (selectedIdol?.id) {
      return selectedIdol.id === 'bangjeemin' ? 'jimin_bang' : selectedIdol.id;
    }
    
    if (hasIdolInStorage) {
      const lowerIdol = hasIdolInStorage.toLowerCase().trim();
      
      if (lowerIdol.includes("youngji") || lowerIdol.includes("영지")) {
        return "leeyoungji";
      }
      if (lowerIdol.includes("jimin") || lowerIdol.includes("지민") || lowerIdol.includes("izna") || lowerIdol.includes("jeemin")) {
        return "jimin_bang";
      }
      if (lowerIdol.includes("jungkook") || lowerIdol.includes("정국")) {
        return "jungkook";
      }
      if (lowerIdol.includes("karina") || lowerIdol.includes("카리나")) {
        return "karina";
      }
      if (lowerIdol.includes("youngk") || lowerIdol.includes("영케이")) {
        return "youngk";
      }

      const matched = idols.find(
        (i) => i.name.toLowerCase() === lowerIdol || i.id === lowerIdol || i.id?.includes(lowerIdol)
      );
      return matched?.id || hasIdolInStorage;
    }
    return null;
  }, [selectedIdol, hasIdolInStorage]);

  const { filteredPlaces } = usePlaces(currentIdolId, currentUserEmail);
  const { removeCourse, updateCourse, loadCourses } = useCourse();

  useEffect(() => {
    if (hasIdolInStorage) {
      const lower = hasIdolInStorage.toLowerCase().trim();
      
      const matchedIdol = idols.find((i) => {
        const idMatch = i.id.toLowerCase();
        const nameMatch = i.name.toLowerCase();
        const groupMatch = i.groupLabel.toLowerCase();
        
        return (
          idMatch.includes(lower) || 
          nameMatch.includes(lower) || 
          groupMatch.includes(lower) ||
          (lower.includes("지민") && idMatch === "jimin_bang") ||
          (lower.includes("영지") && idMatch === "leeyoungji") ||
          (lower.includes("정국") && idMatch === "jungkook") ||
          (lower.includes("카리나") && idMatch === "karina") ||
          (lower.includes("영케이") && idMatch === "youngk")
        );
      });
      
      if (matchedIdol) {
        if (matchedIdol.id !== selectedIdol?.id) {
          onIdolChange(matchedIdol);
        }
        localStorage.setItem("selected_idol", JSON.stringify(matchedIdol));
      }
    }
  }, [hasIdolInStorage, onIdolChange, selectedIdol?.id]);

  const displayPlaces = useMemo(
    () =>
      categoryFilter
        ? filteredPlaces.filter((p) => p.category === categoryFilter)
        : filteredPlaces,
    [filteredPlaces, categoryFilter],
  );

  const handlePlaceClick = useCallback((placeOrId) => {
    if (!placeOrId) return;
    let id = "";
    if (typeof placeOrId === "object") {
      id = placeOrId.id || placeOrId.spotId || placeOrId._id || placeOrId.placeId;
    } else {
      id = placeOrId;
    }
    if (id && String(id) !== "undefined" && String(id).trim() !== "") {
      setSelectedPlaceId(String(id));
    }
  }, []);

  const handleCourseOpen = useCallback((course) => setSelectedCourse(course), []);

  const handleIdolSelect = async (idol) => {
    if (!idol) { setIsModalOpen(false); return; }
    onIdolChange(idol);
    setIsModalOpen(false);
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    const userObj = JSON.parse(savedUser);
    userObj.favorite_idol = idol.name;
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("selected_idol", JSON.stringify(idol));
    localStorage.setItem("starspot.selectedIdol", JSON.stringify(idol));

    try {
      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;
      await axios.put(`/api/users/profile`, {
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
          courseVersion={courseVersion}
          idolId={currentIdolId}
          onPlaceClick={handlePlaceClick}
          onCourseOpen={handleCourseOpen}
          onRouteSearch={setRouteCoords}
          mapCenter={mapCenter}
          myLocation={myLocation}
          routeCoords={routeCoords}
          courseRoute={courseRoute}
          onCourseRouteClear={() => setCourseRoute(null)}
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
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
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
            isOpen={!!selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onSave={async (updatedCourse) => {
              if (String(updatedCourse.id).startsWith('rec-')) {
                alert("추천 코스는 수정할 수 없습니다!");
                return;
              }

              try {
                const storedUser = localStorage.getItem('user');
                const userEmail = storedUser ? JSON.parse(storedUser)?.email : null;
                
                await axios.post(`/api/courses-update-bypass/${updatedCourse.id}`, {
                  title: updatedCourse.title,
                  spotIds: updatedCourse.places.map(p => p.id),
                  userEmail
                });

                setCourseVersion(prev => prev + 1); 
                setSelectedCourse(null);
                alert("코스가 성공적으로 수정되었습니다!");
              } catch (err) {
                console.error("코스 수정 실패:", err);
                alert("수정 실패: " + err.message);
              }
            }}

            onDelete={(id) => {
              removeCourse(id);
              setSelectedCourse(null);
            }}
            onCourseRoute={(places) => {
              setCourseRoute({ id: Date.now(), places });
              setActiveNav("route");
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