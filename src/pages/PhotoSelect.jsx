import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PhotoSelect.css";
import MapView from "../components/layout/MapView";
import PlaceDetailModal from "../components/place/PlaceDetailModal";
import Sidebar from "../components/sidebar/Sidebar";
import ActivePanel from "../components/sidebar/ActivePanel";
import { CloseIcon } from "../components/common/icons";
import { usePlaces } from "../hooks/usePlaces";
import { setPendingReview } from "../stores/reviewStore";
import { readCapturedPhotos, clearCapturedPhotos } from "../utils/photoStorage";
import { SESSION_KEY_REVIEW_PLACE } from "../constants/storageKeys";

const FEED_PLACEHOLDER = "여기에 하고 싶은 말을 입력해주세요..";

const formatToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

function StarIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="m20 4.6 4.5 9.1 10.1 1.5-7.3 7.1 1.7 10-9-4.8-9 4.8 1.7-10-7.3-7.1 10.1-1.5L20 4.6Z" />
    </svg>
  );
}

export default function PhotoSelect({ selectedIdol }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("search");
  const [capturedPhotos] = useState(readCapturedPhotos);
  const [selectedId, setSelectedId] = useState(null);
  const [today] = useState(formatToday);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // ── reviewFlow: 리뷰용 사진 선택 모드 상태 관리 ──
  const [reviewFlow] = useState(() => {
    try {
      return !!sessionStorage.getItem(SESSION_KEY_REVIEW_PLACE);
    } catch {
      return false;
    }
  });

  const [reviewPlaceId] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY_REVIEW_PLACE);
      if (saved) sessionStorage.removeItem(SESSION_KEY_REVIEW_PLACE);
      return saved || null;
    } catch {
      return null;
    }
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview] = useState(null);
  const { filteredPlaces } = usePlaces(selectedIdol?.id);

  const selectedPhoto =
    capturedPhotos.find((item) => item.id === selectedId) ?? capturedPhotos[0];

  // 장소 클릭 시 전면 상세페이지(/place/:id)로 이동시키는 핸들러
  const handlePlaceClick = useCallback(
    (id) => {
      if (id && id !== "undefined") {
        navigate(`/place/${id}`);
      }
    },
    [navigate],
  );

  // ── 최종 데이터 등록 핸들러 ──
  const handleSubmit = async () => {
    if (reviewFlow) {
      if (!selectedPhoto) return;
      setPendingReview(reviewPlaceId, selectedPhoto.src);
      clearCapturedPhotos();
      navigate("/home");
      return;
    }

    if (!content.trim()) {
      setSubmitError("글 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = savedUser?.email || savedUser?.user_email;

      let targetSpotId =
        selectedPlaceId ||
        reviewPlaceId ||
        sessionStorage.getItem("review_place_id");

      const idolName = selectedIdol?.name || "";

      if (!targetSpotId || isNaN(Number(targetSpotId))) {
        if (idolName.includes("정국")) {
          targetSpotId = "1";
        } else if (idolName.includes("지민")) {
          targetSpotId = "5";
        } else if (idolName.includes("카리나")) {
          targetSpotId = "8";
        } else if (idolName.includes("영케이")) {
          targetSpotId = "11";
        } else if (idolName.includes("영지")) {
          targetSpotId = "14";
        } else if (idolName.includes("재현")) {
          targetSpotId = "17";
        } else {
          targetSpotId =
            filteredPlaces && filteredPlaces[0]?.id
              ? String(filteredPlaces[0].id)
              : "1";
        }
      }

      const formData = new FormData();
      formData.append("userEmail", userEmail);
      formData.append("spotId", targetSpotId);
      formData.append("title", `${idolName} 성지순례 후기`);
      formData.append("content", content.trim());

      if (selectedPhoto.src.startsWith("data:")) {
        const response = await fetch(selectedPhoto.src);
        const blob = await response.blob();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);
      } else {
        formData.append("photo", selectedPhoto.src);
      }

      const res = await axios.post(
        "http://localhost:5000/api/users/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      clearCapturedPhotos();
      alert(res.data.message);
      navigate("/home");
    } catch (error) {
      console.error("리뷰 및 방문기록 등록 실패:", error);
      setSubmitError(
        error.response?.data?.message || "등록 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (capturedPhotos.length === 0) {
    return (
      <main
        className="photo-select-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
          촬영된 사진이 없어요.
        </p>
        <button
          type="button"
          onClick={() => navigate("/photo")}
          style={{
            padding: "12px 28px",
            borderRadius: 12,
            border: "none",
            background: "#e8d664",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          다시 촬영하기
        </button>
      </main>
    );
  }

  return (
    <main className="photo-select-page">
      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        idolImage={selectedIdol?.profile}
        panelOpen={false}
      >
        <ActivePanel
          navId={activeNav}
          selectedIdol={selectedIdol}
          onPlaceClick={handlePlaceClick}
        />
      </Sidebar>

      <section className="photo-map-area" aria-label="지도">
        <MapView places={filteredPlaces} onPlaceClick={handlePlaceClick} />

        {!reviewFlow && selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
            initialReview={newReview}
          />
        )}

        <section
          className={`photo-modal ${isModalOpen ? "" : "is-hidden"}`}
          role="dialog"
          aria-modal="true"
          aria-label="사진 선택"
        >
          <button
            className="photo-modal-close"
            type="button"
            aria-label="닫기"
            onClick={() => setIsModalOpen(false)}
          >
            <CloseIcon />
          </button>

          <div className="photo-thumb-column">
            {capturedPhotos.map((item) => (
              <button
                className={`photo-thumb ${selectedPhoto.id === item.id ? "selected" : ""}`}
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <img src={item.src} alt={`사진 ${item.id}`} />
                <StarIcon />
              </button>
            ))}
          </div>

          <div className="photo-editor-card">
            <img src={selectedPhoto.src} alt="선택된 사진" />
            <p>{today}</p>

            {reviewFlow ? (
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(45,47,54,0.45)",
                  margin: "4px 0 0",
                  textAlign: "center",
                }}
              >
                사진을 고른 후 버튼을 눌러주세요
              </p>
            ) : (
              <>
                <textarea
                  aria-label="피드 내용"
                  placeholder={FEED_PLACEHOLDER}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={500}
                />
                {submitError && (
                  <strong className="photo-submit-error">{submitError}</strong>
                )}
              </>
            )}
          </div>

          <button
            className="photo-submit-button"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "처리 중"
              : reviewFlow
                ? "이 사진으로 리뷰 쓰기"
                : "등록"}
          </button>
        </section>
      </section>
    </main>
  );
}
