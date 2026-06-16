import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { generateShareLink } from "../../services/courseService";

const COURSE_MIN_PLACES = 2;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 400;
  pointer-events: none;
`;

const Modal = styled.div`
  pointer-events: all;
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  max-height: calc(100% - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalHeader = styled.div`
  padding: 18px 16px 12px;
  border-bottom: 1px solid rgba(45, 47, 54, 0.07);
  flex-shrink: 0;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: rgba(45, 47, 54, 0.35);
  cursor: pointer;
  line-height: 1;
  padding: 2px;
  transition: color 0.15s;
  &:hover {
    color: #2d2f36;
  }
`;

const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #e8b664;
  margin: 0 28px 4px 0;
`;

const TitleInput = styled.input`
  width: 100%;
  border: 1px solid rgba(45, 47, 54, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 6px;
  outline: none;
  &:focus {
    border-color: #e8b664;
  }
`;

const TitleText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 6px;
  padding: 8px 10px;
`;

const ModalDesc = styled.p`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.45);
  margin: 0;
  line-height: 1.5;
`;

const SharedBadge = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #4a9d8f;
  background: rgba(74, 157, 143, 0.1);
  border: 1px solid rgba(74, 157, 143, 0.3);
  border-radius: 6px;
  padding: 2px 8px;
  margin-bottom: 8px;
`;

const PlaceList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 47, 54, 0.15);
    border-radius: 4px;
  }
`;

const PlaceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(45, 47, 54, 0.09);
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  transition: border-color 0.15s;
  &:hover {
    border-color: rgba(232, 214, 100, 0.5);
  }
`;

const NumBadge = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PlaceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlaceName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #2d2f36;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaceAddr = styled.div`
  font-size: 10px;
  color: rgba(45, 47, 54, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const ArrowBtns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ArrowBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 9px;
  color: rgba(45, 47, 54, 0.3);
  cursor: pointer;
  padding: 1px 3px;
  line-height: 1;
  &:hover {
    color: #e8b664;
  }
  &:disabled {
    opacity: 0.15;
    cursor: default;
  }
`;

const Footer = styled.div`
  padding: 12px 14px 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(45, 47, 54, 0.07);
`;

const ShareBtn = styled.button`
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid rgba(232, 214, 100, 0.5);
  background: rgba(232, 214, 100, 0.12);
  color: #b8962a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(232, 214, 100, 0.25);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: #e8d664;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #d4c250;
  }
  &:disabled {
    background: #e2e2e2;
    color: #aaaaaa;
    cursor: not-allowed;
  }
`;

const AddBtn = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: #4a9d8f;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #3d8577;
  }
  &:disabled {
    background: #e2e2e2;
    color: #aaaaaa;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(45, 47, 54, 0.15);
  background: #ffffff;
  color: rgba(45, 47, 54, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #f9f9f9;
  }
`;

const StatusMsg = styled.div`
  font-size: 11px;
  color: ${({ $error }) => ($error ? "#e85050" : "#4a9d8f")};
  text-align: center;
`;

export default function CourseDetailModal({
  course,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState("");
  const [places, setPlaces] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setPlaces(course.places || []);
    } else {
      setTitle("");
      setPlaces([]);
    }
    setStatusMsg(null);
  }, [course, isOpen]);

  if (!course) return null;

  const storedUser = localStorage.getItem("user");
  const loggedInEmail = storedUser ? JSON.parse(storedUser)?.email : null;

  const isShared = !!(course.userEmail && loggedInEmail && course.userEmail !== loggedInEmail);

  const reorder = (from, to) => {
    const arr = [...places];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setPlaces(arr);
  };

  const handleShare = () => {
    const link = generateShareLink(course.id);
    navigator.clipboard?.writeText(link).catch(() => {});
    setStatusMsg({ text: "링크가 클립보드에 복사됐어요!", error: false });
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handleAddToMyCourses = async () => {
    if (!loggedInEmail) {
      setStatusMsg({ text: "로그인이 필요합니다.", error: true });
      return;
    }
    setIsAdding(true);
    try {
      const spotIds = places.map((p) => p.id).filter(Boolean);
      await axios.post("/api/courses", {
        title: course.title,
        spotIds,
        userEmail: loggedInEmail,
      });
      setStatusMsg({ text: "내 코스에 추가되었습니다!", error: false });
      setTimeout(() => {
        setStatusMsg(null);
        handleCloseAndReset();
      }, 1500);
    } catch {
      setStatusMsg({ text: "추가에 실패했습니다. 다시 시도해주세요.", error: true });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCloseAndReset = () => {
    setTitle("");
    setPlaces([]);
    setStatusMsg(null);
    onClose();
  };

  const isInvalid = !title.trim() || places.length < COURSE_MIN_PLACES;

  return (
    <Overlay style={{ pointerEvents: isOpen ? "all" : "none" }}>
      <Modal>
        <ModalHeader>
          <CloseBtn onClick={handleCloseAndReset}>✕</CloseBtn>
          <ModalTitle>{isShared ? "공유된 코스" : "나만의 코스 관리"}</ModalTitle>

          {isShared ? (
            <>
              <SharedBadge>👤 {course.userEmail?.split("@")[0]} 님의 코스</SharedBadge>
              <TitleText>{title}</TitleText>
            </>
          ) : (
            <TitleInput
              type="text"
              placeholder="코스 이름을 지정해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}

          <ModalDesc>
            {places.map((p) => p.name || p.placeName).join(" → ")}
          </ModalDesc>
        </ModalHeader>

        <PlaceList>
          {places.map((place, i) => (
            <PlaceRow key={place.id ?? i}>
              <NumBadge>{i + 1}</NumBadge>
              <PlaceInfo>
                <PlaceName>{place.name || place.placeName}</PlaceName>
                <PlaceAddr>{place.address}</PlaceAddr>
              </PlaceInfo>
              {!isShared && (
                <ArrowBtns>
                  <ArrowBtn disabled={i === 0} onClick={() => reorder(i, i - 1)}>▲</ArrowBtn>
                  <ArrowBtn disabled={i === places.length - 1} onClick={() => reorder(i, i + 1)}>▼</ArrowBtn>
                </ArrowBtns>
              )}
            </PlaceRow>
          ))}
        </PlaceList>

        <Footer>
          {statusMsg && (
            <StatusMsg $error={statusMsg.error}>{statusMsg.text}</StatusMsg>
          )}

          {/* ✂️ 기존 "🗺️ 코스 길찾기" 버튼 컴포넌트 삭제 완료 */}

          {isShared ? (
            <AddBtn onClick={handleAddToMyCourses} disabled={isAdding}>
              {isAdding ? "추가 중..." : "⭐ 내 코스에 추가하기"}
            </AddBtn>
          ) : (
            <>
              {course.id && (
                <ShareBtn onClick={handleShare}>🔗 코스 공유하기</ShareBtn>
              )}
              <SubmitBtn
                disabled={isInvalid}
                onClick={() => {
                  onSave({ ...course, title, places });
                  handleCloseAndReset();
                }}
              >
                {course.id ? "코스 수정 완료" : "코스 생성"}
              </SubmitBtn>
              {course.id ? (
                <CancelBtn
                  style={{ borderColor: "#ff6b6b", color: "#ff6b6b" }}
                  onClick={() => {
                    onDelete(course.id);
                    handleCloseAndReset();
                  }}
                >
                  코스 완전 삭제
                </CancelBtn>
              ) : (
                <CancelBtn onClick={handleCloseAndReset}>취소</CancelBtn>
              )}
            </>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
}