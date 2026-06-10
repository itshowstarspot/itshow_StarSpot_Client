import { useState, useMemo, useCallback, useEffect } from "react"; // 🌟 useEffect 추가
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

/* ── 지도 영역: 나머지 공간 채움 ── */
const MapArea = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    () => getPendingReview()?.placeId ?? null,
  );
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { filteredPlaces } = usePlaces(selectedIdol?.id);
  const { removeCourse } = useCourse();

  // 🌟 1. useEffect 내부 로직을 아래와 같이 수정하여 로컬스토리지의 '진짜 최애 유무'를 판단합니다.
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);

      // 로컬스토리지에 최애 아이돌이 명확하게 등록되어 있다면 매핑해서 부모 상태 업데이트
      if (userObj.favorite_idol) {
        const matchedIdol = idols.find(
          (i) =>
            i.name === userObj.favorite_idol || i.id === userObj.favorite_idol,
        );
        if (matchedIdol && matchedIdol.id !== selectedIdol?.id) {
          onIdolChange(matchedIdol);
        }
      } else {
        // 🌟 로컬스토리지에 최애가 null(없음)이면 부모가 준 기본값(정국 등)을 강제로 비워버립니다!
        if (selectedIdol !== null) {
          onIdolChange(null);
        }
      }
    }
  }, [selectedIdol, onIdolChange]);

  const displayPlaces = useMemo(
    () =>
      categoryFilter
        ? filteredPlaces.filter((p) => p.category === categoryFilter)
        : filteredPlaces,
    [filteredPlaces, categoryFilter],
  );

  // 🌟 2. 모달을 띄우는 조건식 라인을 아래와 같이 변경합니다.
  const shouldOpenIdolModal = isModalOpen || (!skipIdolPrompt && !selectedIdol);

  const handlePlaceClick = useCallback((id) => setSelectedPlaceId(id), []);
  const handleCourseOpen = useCallback(
    (course) => setSelectedCourse(course),
    [],
  );

  // 🌟 handleIdolSelect 함수를 아래 코드로 통째로 덮어씌우세요!
  const handleIdolSelect = async (idol) => {
    // 부모(App.jsx) 상태 업데이트 및 수동 모달 상태(isModalOpen) 닫기
    onIdolChange(idol);
    setIsModalOpen(false);

    // 로컬스토리지 데이터 동기화
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    const userObj = JSON.parse(savedUser);
    userObj.favorite_idol = idol.name;
    localStorage.setItem("user", JSON.stringify(userObj));

    // 백엔드 데이터베이스 실시간 반영
    try {
      // 🌟 [수정] 테이블 구조 분석 결과: 'id'가 유저 고유 번호(PK)입니다.
      // 만약 세션 구조상 email만 저장되어 있다면 대조할 수 있도록 둘 다 구조 분해 할당합니다.
      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;

      await axios.put(`http://localhost:5000/api/users/profile`, {
        userId: userId,
        email: userEmail, // PK가 없을 때를 대비해 email도 함께 백엔드로 전송
        favorite_idol: idol.name,
      });

      console.log("백엔드 DB에 최애 아이돌 동기화 성공! 🔄⭐");
    } catch (err) {
      console.error("백엔드 DB 최애 아이돌 업데이트 실패:", err);
    }
  };

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

      {/* ─── 아이돌 선택 모달 ─── */}
      <IdolSelectModal
        isOpen={shouldOpenIdolModal}
        idols={idols}
        onSelect={handleIdolSelect}
      />
    </Page>
  );
}
