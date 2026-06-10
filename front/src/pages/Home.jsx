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

/* ── 전체 레이아웃 ── */
const Page = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f8;
`;

/* ── 지도 영역 ── */
const MapArea = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

/* ── 모바일 패널 토글 버튼 ── */
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

/* ── 모바일 패널 오버레이 배경 ── */
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

  // 🌟 [안전화] 로컬스토리지 파싱 로직의 최상단 스코프 고정
  const hasIdolInStorage = useMemo(() => {
    const savedUserStr = localStorage.getItem("user");
    if (!savedUserStr) return null;
    try {
      const userObj = JSON.parse(savedUserStr);
      const idolName =
        userObj.favorite_idol || userObj.favoriteIdol || userObj.favorite;
      if (idolName && idolName !== "선택 안 됨" && idolName !== "null") {
        return idolName;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // 🌟 [안전화] 동기화 누수를 방지하기 위한 이중 바리케이드 초기 셋업
  const [isModalOpen, setIsModalOpen] = useState(() => {
    const savedIdol = localStorage.getItem("selected_idol");
    if (savedIdol) return false;
    if (hasIdolInStorage) return false;
    return !skipIdolPrompt;
  });

  // 상위 주입 상태 동기화용 변수 계산
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

  // 커스텀 훅 호출 (Hook 규칙 준수)
  const { filteredPlaces } = usePlaces(currentIdolId);
  const { removeCourse } = useCourse();

  // 부모 상태(App.jsx)와 동기화 시켜주는 useEffect 및 캐시 복구 강제화
  useEffect(() => {
    if (hasIdolInStorage) {
      const matchedIdol = idols.find(
        (i) => i.name === hasIdolInStorage || i.id === hasIdolInStorage,
      );
      if (matchedIdol) {
        if (matchedIdol.id !== selectedIdol?.id) {
          onIdolChange(matchedIdol);
        }
        // 기존 회원이 로그인 시 selected_idol 스토리지가 비어있다면 자동 복구 유도
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
        userId: userId,
        email: userEmail,
        favorite_idol: idol.name,
      });
      console.log("백엔드 DB에 최애 아이돌 동기화 성공! 🔄⭐");
    } catch (err) {
      console.error("백엔드 DB 최애 아이돌 업데이트 실패:", err);
    }
  };

  // 🌟 최종 차단 플래그 연산
  const hasAnyIdol =
    selectedIdol || localStorage.getItem("selected_idol") || hasIdolInStorage;
  const shouldOpenIdolModal = hasAnyIdol ? false : isModalOpen;

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
            onDelete={(id) => {
              removeCourse(id);
              setSelectedCourse(null);
            }}
          />
        )}
      </MapArea>

      <PanelOverlay $open={panelOpen} onClick={() => setPanelOpen(false)} />

      {/* ─── 아이돌 선택 모달 (새 회원 타겟 완전 분기 완료) ─── */}
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
