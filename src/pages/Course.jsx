import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CourseCard from "../components/course/CourseCard";
import Modal from "../components/common/Modal";
import { useCourse } from "../hooks/useCourse";
import { usePlaces } from "../hooks/usePlaces";
import { COURSE_MIN_PLACES } from "../domain/course/course";
import { fetchRecommendedCourses } from "../services/courseService";
import CourseDetailModal from "../components/sidebar/CourseDetailModal";
import CoursePlaceItem from "../components/course/CoursePlaceItem";

const Page = styled.main`
  min-height: 100vh;
  background: #f5f5f8;
  color: #2d2f36;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45, 47, 54, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 20px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
`;

const Content = styled.div`
  padding: 20px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 14px;
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SelectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlacePickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
`;

const PlacePickBtn = styled.button`
  padding: 10px 14px;
  background: ${({ $selected }) =>
    $selected ? "rgba(232,214,100,0.1)" : "#ffffff"};
  border: 1.5px solid
    ${({ $selected }) => ($selected ? "#e8d664" : "rgba(45,47,54,0.12)")};
  border-radius: 10px;
  color: ${({ $selected }) => ($selected ? "#b8962a" : "#2d2f36")};
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    border-color: #e8d664;
  }
`;

const TitleInput = styled.input`
  width: 100%;
  background: #f5f5f8;
  border: 1px solid rgba(45, 47, 54, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  color: #2d2f36;
  font-size: 14px;
  outline: none;
  margin-bottom: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: #e8d664;
  }
  &::placeholder {
    color: rgba(45, 47, 54, 0.35);
  }
`;

const ErrorMsg = styled.p`
  font-size: 13px;
  color: #e85050;
  margin-top: 6px;
`;

const ShareToast = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #e8d664;
  color: #1a1a1a;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`;

export default function Course({ selectedIdol }) {
  const navigate = useNavigate();

  const {
    courses,
    selectedPlaces,
    addPlace,
    removePlace,
    reorderPlaces,
    submitCourse,
    updateCourse,
    loadCourses,
    removeCourse,
    shareCourse,
    isLoading,
    error,
  } = useCourse();

  const { places = [] } = usePlaces(selectedIdol?.id);

  const [isCreating, setIsCreating] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const toastTimerRef = useRef(null);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setRecLoading(true);
    fetchRecommendedCourses(selectedIdol?.id)
      .then(setRecommendedCourses)
      .catch((err) => {
        console.warn("[Course] 추천 코스 조회 실패:", err);
        setRecommendedCourses([]);
      })
      .finally(() => setRecLoading(false));
  }, [selectedIdol?.id]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const handleShare = (courseId) => {
    shareCourse(courseId);
    clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const handleUpdate = async (updatedCourse) => {
    console.log("=== [디버깅] 코스 수정 요청 ===", updatedCourse);
    
    const result = await updateCourse(updatedCourse.id, {
      title: updatedCourse.title,
      places: updatedCourse.places,
    });
    
    if (result) {
      setIsDetailOpen(false);
      setSelectedCourse(null);
      alert("코스가 성공적으로 수정되었습니다!");
    } else {
      alert("코스 수정에 실패했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!courseTitle.trim()) return;

    try {
      const result = await submitCourse({
        title: courseTitle,
        idolId: selectedIdol?.id,
      });

      if (result) {
        setCourseTitle("");
        setIsCreating(false);
      }
    } catch (err) {
      console.error("코스 생성 에러:", err);
    }
  };

  const validPlacesCount = Array.isArray(selectedPlaces) ? selectedPlaces.length : 0;
  const isFormValid = courseTitle.trim().length > 0 && validPlacesCount >= COURSE_MIN_PLACES;

  return (
    <Page>
      <TopBar>
        <TopLeft>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Title>코스</Title>
        </TopLeft>
        <Button
          size="sm"
          style={{ color: "#ffffff" }}
          onClick={() => setIsCreating(true)}
        >
          + 새 코스
        </Button>
      </TopBar>

      <Content>
        {/* 추천 코스 */}
        <div>
          <SectionTitle>⭐ 추천 코스</SectionTitle>
          {recLoading && <LoadingSpinner />}
          {!recLoading && recommendedCourses.length === 0 && (
            <EmptyState
              icon="🗺️"
              message="아이돌을 선택하면 추천 코스가 표시돼요!"
            />
          )}
          <CourseList>
            {(Array.isArray(recommendedCourses)
              ? recommendedCourses
              : recommendedCourses?.data || []
            ).map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                places={course.places}
                description={course.description}
              />
            ))}
          </CourseList>
        </div>

        {/* 내 코스 목록 */}
        <div>
          <SectionTitle>📍 내 코스</SectionTitle>
          {isLoading && <LoadingSpinner />}
          {!isLoading && courses.length === 0 && (
            <EmptyState
              icon="➕"
              message="아직 만든 코스가 없어요. 새 코스를 만들어보세요!"
            />
          )}
          <CourseList>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                places={course.places}
                onShare={() => handleShare(course.id)}
                onDelete={() => removeCourse(course.id)}
                onClick={() => {
                  setSelectedCourse(course);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </CourseList>
        </div>
      </Content>

      {/* 코스 생성 모달 */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
        <h2 style={{ color: "#2d2f36", marginBottom: 16 }}>새 코스 만들기</h2>
        <TitleInput
          placeholder="코스 이름 입력"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          maxLength={50}
        />
        <p style={{ fontSize: 14, fontWeight: 700, color: "#2d2f36", marginBottom: 10 }}>
          장소 선택 (최소 {COURSE_MIN_PLACES}개)
        </p>

        {!places || places.length === 0 ? (
          <EmptyState icon="📍" message="선택 가능한 장소가 없어요." />
        ) : (
          <PlacePickerGrid>
            {places.map((place) => {
              const isSelected = Array.isArray(selectedPlaces) && selectedPlaces.some((p) => p.id === place.id);
              return (
                <PlacePickBtn
                  key={place.id}
                  $selected={isSelected}
                  onClick={() => isSelected ? removePlace(place.id) : addPlace(place)}
                >
                  {isSelected ? "✓ " : ""}
                  {place.name}
                </PlacePickBtn>
              );
            })}
          </PlacePickerGrid>
        )}

        {validPlacesCount > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#2d2f36", marginBottom: 10 }}>순서 조정</p>
            <SelectedList>
              {Array.isArray(selectedPlaces) && selectedPlaces.map((place, idx) => (
                <CoursePlaceItem
                  key={place.id}
                  index={idx}
                  place={place}
                  onRemove={() => removePlace(place.id)}
                />
              ))}
            </SelectedList>
          </div>
        )}

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button variant="secondary" fullWidth onClick={() => setIsCreating(false)}>취소</Button>
          <Button fullWidth onClick={handleSubmit} disabled={!isFormValid || isLoading}>
            {isLoading ? "생성 중..." : "코스 생성"}
          </Button>
        </div>
      </Modal>

      {/* 코스 상세 및 관리 모달 */}
      {isDetailOpen && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedCourse(null);
          }}
          onSave={handleUpdate} 
          onDelete={(id) => {
            removeCourse(id);
            setIsDetailOpen(false);
            setSelectedCourse(null);
          }}
          onCourseRoute={(places) => {
            console.log("길찾기 장소 리스트:", places);
          }}
        />
      )}
      {showToast && <ShareToast>🔗 링크가 클립보드에 복사되었어요!</ShareToast>}
    </Page>
  );
}