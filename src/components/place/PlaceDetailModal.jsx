import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { fetchPlaceDetail } from "../../services/placeService";
import { createFeed, fetchFeeds } from "../../services/feedService";
import { useFavorites } from "../../hooks/useFavorites";
import LoadingSpinner from "../common/LoadingSpinner"; // 👈 경로 교정 완료
import { getPendingReview, clearPendingReview } from "../../stores/reviewStore";
import { readCapturedPhotos } from "../../utils/photoStorage";
import { SESSION_KEY_REVIEW_PLACE } from "../../constants/storageKeys";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 300;
  pointer-events: none;
`;

const Modal = styled.div`
  pointer-events: all;
  position: absolute;
  top: 20px;
  left: 20px;
  width: 260px;
  max-height: calc(100% - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`;

const HeroImage = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #d9d9d9;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.42);
  border: none;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.15s;
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 47, 54, 0.15);
    border-radius: 4px;
  }
`;

const TopInfo = styled.div`
  padding: 12px 14px 0;
`;

const SubDesc = styled.p`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.5);
  margin: 0 0 4px;
  line-height: 1.4;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: #2d2f36;
    margin: 0;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 6px;
  margin: 6px 0 10px 0;
`;

const ActionBtn = styled.button`
  flex: 1;
  border: 1px solid rgba(45, 47, 54, 0.15);
  background: #fff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  &:hover {
    background: #f9f9fa;
  }
`;

const StarBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  color: #e8d664;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.15s;
  &:hover {
    transform: scale(1.2);
  }
`;

const Section = styled.div`
  padding: 14px 14px 0;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #e8c664;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid rgba(232, 214, 100, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid rgba(232, 214, 100, 0.45);
  margin-bottom: 14px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: stretch;
  & + & {
    border-top: 1.5px solid rgba(232, 214, 100, 0.35);
  }
`;

const InfoLabel = styled.div`
  width: 52px;
  flex-shrink: 0;
  background: rgba(232, 214, 100, 0.22);
  border-right: 1.5px solid rgba(232, 214, 100, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #7a6a10;
  padding: 8px 4px;
  text-align: center;
`;

const InfoValue = styled.div`
  flex: 1;
  padding: 8px 10px;
  font-size: 11px;
  color: rgba(45, 47, 54, 0.7);
  line-height: 1.45;
  display: flex;
  align-items: center;
`;

const Desc = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.65);
  line-height: 1.6;
  margin: 0 0 14px;
`;

const EmptyText = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.35);
  text-align: center;
  padding: 16px 0 14px;
  margin: 0;
`;

const BottomPad = styled.div`
  height: 16px;
`;

const WriteBtn = styled.button`
  font-size: 11px;
  font-weight: 700;
  color: #b8962a;
  background: rgba(232, 214, 100, 0.15);
  border: 1px solid rgba(232, 214, 100, 0.4);
  border-radius: 999px;
  padding: 3px 10px;
  cursor: pointer;
  &:hover {
    background: rgba(232, 214, 100, 0.3);
  }
`;

/* 바텀시트 구성 요소 스타일 */
const SheetDim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
`;
const Sheet = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${keyframes`from { transform: translateY(100%); } to { transform: translateY(0); }`}
    0.28s ease;
`;
const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(45, 47, 54, 0.15);
  margin: 0 auto 4px;
`;
const SheetTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  text-align: center;
`;
const SheetPlace = styled.div`
  font-size: 13px;
  color: rgba(45, 47, 54, 0.5);
  text-align: center;
  margin-top: -6px;
`;
const PhotoArea = styled.div`
  width: 100%;
  aspect-ratio: 4/5;
  border: 2px dashed rgba(45, 47, 54, 0.2);
  border-radius: 16px;
  cursor: pointer;
  background: #f0f0f4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const PhotoPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(45, 47, 54, 0.35);
  font-size: 13px;
`;
const RemovePhotoBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ThumbRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
`;
const ThumbBtn = styled.button`
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  padding: 0;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 2.5px solid
    ${({ $selected }) => ($selected ? "#e8d664" : "rgba(45,47,54,0.12)")};
  background: #f0f0f4;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const ReviewTextarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 1.5px solid rgba(45, 47, 54, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  color: #2d2f36;
  resize: none;
  outline: none;
  box-sizing: border-box;
`;
const SheetActions = styled.div`
  display: flex;
  gap: 10px;
`;
const CancelBtn = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid rgba(45, 47, 54, 0.15);
  background: #fff;
  color: rgba(45, 47, 54, 0.6);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
const SubmitBtn = styled.button`
  flex: 2;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: #e8d664;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    background: rgba(232, 214, 100, 0.3);
    color: rgba(45, 47, 54, 0.3);
  }
`;
const ErrorMsg = styled.p`
  font-size: 13px;
  color: #e85050;
  text-align: center;
  margin: 0;
`;
const Toast = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d2f36;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 999px;
  z-index: 9999;
`;
const ReviewCard = styled.div`
  margin-bottom: 8px;
  border-radius: 8px;
  background: #f5f5f8;
  padding: 10px 12px;
`;
const ReviewImg = styled.img`
  width: 100%;
  border-radius: 6px;
  margin-bottom: 6px;
  object-fit: cover;
  max-height: 160px;
`;
const ReviewText = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.75);
  margin: 0;
  line-height: 1.5;
`;

function ReviewSheet({
  place,
  onClose,
  onSubmit,
  onFrameCapture,
  initialPhoto,
}) {
  const capturedPhotos = readCapturedPhotos();
  const [selectedId, setSelectedId] = useState(capturedPhotos[0]?.id ?? null);
  const [reviewText, setReviewText] = useState("");
  const [photoPreview, setPhotoPreview] = useState(initialPhoto ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedSrc =
    capturedPhotos.find((p) => p.id === selectedId)?.src ??
    photoPreview ??
    null;

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setSubmitError("후기를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({ reviewText, photoSrc: selectedSrc });
      onClose();
    } catch (err) {
      setSubmitError(err.message || "등록에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetDim onClick={onClose}>
      <Sheet
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <SheetHandle />
        <SheetTitle>리뷰 작성</SheetTitle>
        <SheetPlace>{place?.name}</SheetPlace>
        {capturedPhotos.length > 0 && (
          <ThumbRow>
            {capturedPhotos.map((photo) => (
              <ThumbBtn
                key={photo.id}
                type="button"
                $selected={selectedId === photo.id}
                onClick={() => {
                  setSelectedId(photo.id);
                  setPhotoPreview(photo.src);
                }}
              >
                <img src={photo.src} alt="" />
              </ThumbBtn>
            ))}
          </ThumbRow>
        )}
        <PhotoArea onClick={() => !selectedSrc && onFrameCapture()}>
          {selectedSrc ? (
            <>
              <img src={selectedSrc} alt="선택된 사진" />
              <RemovePhotoBtn
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoPreview(null);
                  setSelectedId(null);
                }}
              >
                ✕
              </RemovePhotoBtn>
            </>
          ) : (
            <PhotoPlaceholder>
              <span style={{ fontSize: 40 }}>📷</span>
              <span>탭해서 사진 선택</span>
            </PhotoPlaceholder>
          )}
        </PhotoArea>
        <ReviewTextarea
          placeholder={`${place?.name ?? "이 장소"}에 대한 후기를 남겨주세요`}
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            setSubmitError("");
          }}
          maxLength={500}
        />
        {submitError && <ErrorMsg>{submitError}</ErrorMsg>}
        <SheetActions>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <SubmitBtn
            onClick={handleSubmit}
            disabled={isSubmitting || !reviewText.trim()}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </SubmitBtn>
        </SheetActions>
      </Sheet>
    </SheetDim>
  );
}

export default function PlaceDetailModal({ placeId, onClose, initialReview }) {
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();
  const [reviews, setReviews] = useState([]);
  const [showSheet, setShowSheet] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (!placeId || placeId === "undefined") return;

    setIsLoading(true);
    setPlace(null);
    setReviews([]);
    setShowSheet(false);
    setPendingPhoto(null);

    fetchPlaceDetail(placeId)
      .then(setPlace)
      .catch((err) => console.error("[PlaceDetailModal] 장소 조회 실패:", err))
      .finally(() => setIsLoading(false));

    fetchFeeds({ placeId: String(placeId) })
      .then((data) => {
        const filteredReviews = data.filter(
          (r) => String(r.placeId) === String(placeId),
        );
        setReviews(filteredReviews);
      })
      .catch((err) => console.warn("[PlaceDetailModal] 리뷰 조회 실패:", err));

    const pending = getPendingReview();
    if (pending?.placeId === placeId) {
      clearPendingReview();
      setPendingPhoto(pending.photoSrc ?? null);
      setShowSheet(true);
    }
  }, [placeId]);

  useEffect(() => {
    if (!initialReview || initialReview.placeId !== placeId) return;
    setReviews((prev) => {
      if (prev.some((r) => r.id === initialReview.id)) return prev;
      return [initialReview, ...prev];
    });
  }, [initialReview, placeId]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const isFavorite = favorites.includes(placeId);

  const handleFrameCapture = () => {
    try {
      sessionStorage.setItem(SESSION_KEY_REVIEW_PLACE, placeId);
    } catch (err) {
      console.error("[PlaceDetailModal] sessionStorage 저장 실패:", err);
    }
    navigate("/photo");
  };

  const showToastMessage = (msg) => {
    clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  };

  const handleReviewSubmit = async ({ reviewText, photoSrc }) => {
    try {
      const savedUser = localStorage.getItem("user");
      let userEmail = "";
      let nickname = "익명";

      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        userEmail = userObj.email || userObj.user_email || "";
        nickname = userObj.nickname || "익명";
      }

      const newReview = await createFeed({
        placeId,
        placeName: place?.name ?? "",
        image: photoSrc ?? "",
        content: reviewText.trim(),
        userEmail,
        nickname,
      });

      setReviews((prev) => [newReview, ...prev]);
      showToastMessage("리뷰가 등록됐어요!");
    } catch (err) {
      console.error("[PlaceDetailModal] 리뷰 등록 실패:", err);
      showToastMessage("리뷰 등록에 실패했어요. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <Overlay>
        <Modal>
          <HeroImage>
            {place?.image && <img src={place.image} alt={place.name} />}
            <CloseBtn onClick={onClose}>✕</CloseBtn>
          </HeroImage>

          {isLoading ? (
            <div style={{ padding: "24px 0" }}>
              <LoadingSpinner />
            </div>
          ) : (
            <ScrollBody>
              <TopInfo>
                <SubDesc>{place?.description || place?.address || ""}</SubDesc>
                <TitleRow>
                  <h2>{place?.name ?? ""}</h2>
                  <StarBtn onClick={() => toggleFavorite(placeId)}>
                    {isFavorite ? "★" : "☆"}
                  </StarBtn>
                </TitleRow>

                <ActionRow>
                  <ActionBtn
                    onClick={() => navigate(`/home?mode=route&placeId=${placeId}`)}
                  >
                    🗺️ 길찾기
                  </ActionBtn>
                </ActionRow>
              </TopInfo>

              {/* 소개 */}
              <Section>
                <SectionTitle>소개</SectionTitle>
                {place?.description ? (
                  <Desc>{place.description}</Desc>
                ) : (
                  <EmptyText>소개 정보가 없어요.</EmptyText>
                )}
              </Section>

              {/* 리뷰 */}
              <Section>
                <SectionTitle>
                  리뷰
                  <WriteBtn type="button" onClick={() => setShowSheet(true)}>
                    ✏️ 리뷰 쓰기
                  </WriteBtn>
                </SectionTitle>
                {reviews.length === 0 ? (
                  <EmptyText>아직 리뷰가 없어요.</EmptyText>
                ) : (
                  reviews.map((r) => (
                    <ReviewCard key={r.id}>
                      {r.image && <ReviewImg src={r.image} alt="" />}
                      <ReviewText>{r.content}</ReviewText>
                    </ReviewCard>
                  ))
                )}
              </Section>

              {/* 정보 */}
              <Section>
                <SectionTitle>정보</SectionTitle>
                <InfoTable>
                  {place?.category && (
                    <InfoRow>
                      <InfoLabel>카테고리</InfoLabel>
                      <InfoValue>{place.category}</InfoValue>
                    </InfoRow>
                  )}
                  {place?.address && (
                    <InfoRow>
                      <InfoLabel>주소</InfoLabel>
                      <InfoValue>{place.address}</InfoValue>
                    </InfoRow>
                  )}
                </InfoTable>
              </Section>
              <BottomPad />
            </ScrollBody>
          )}
        </Modal>
      </Overlay>

      {showSheet && (
        <ReviewSheet
          place={place}
          onClose={() => {
            setShowSheet(false);
            setPendingPhoto(null);
          }}
          onSubmit={handleReviewSubmit}
          onFrameCapture={handleFrameCapture}
          initialPhoto={pendingPhoto}
        />
      )}
      {toast && <Toast>{toast}</Toast>}
    </>
  );
}
