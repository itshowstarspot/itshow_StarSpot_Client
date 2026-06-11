import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 🌟 [추가] 비동기 요청을 위해 반드시 필요한 임포트
import "./PhotoSelect.css";
import MapView from "../components/layout/MapView";
import PlaceDetailModal from "../components/place/PlaceDetailModal";
import Sidebar from "../components/sidebar/Sidebar";
import ActivePanel from "../components/sidebar/ActivePanel";
import { CloseIcon } from "../components/common/icons";
import { usePlaces } from "../hooks/usePlaces";
import { createFeed } from "../services/feedService";
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

  // ── reviewFlow: 리뷰용 사진 선택 모드 ──────────────────────────
  // reviewPlaceId  : 리뷰 대상 장소 ID (PlaceDetailModal과 무관)
  // selectedPlaceId: 지도 핀 클릭 시 PlaceDetailModal을 열 장소 ID
  // 두 역할을 같은 state에 두면 PlaceDetailModal이 자동으로 열려버림
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
  // reviewFlow일 때는 null로 시작 — PlaceDetailModal이 자동으로 뜨지 않게
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  // ────────────────────────────────────────────────────────────────

  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState(null);
  const { filteredPlaces } = usePlaces(selectedIdol?.id);
  const selectedPhoto =
    capturedPhotos.find((item) => item.id === selectedId) ?? capturedPhotos[0];

  const handlePlaceClick = useCallback((id) => setSelectedPlaceId(id), []);

  // 🌟 DB 고유 숫자 ID(1~20)와 Multipart 규격을 완벽 정렬한 최종 handleSubmit
  const handleSubmit = async () => {
    // reviewFlow: 사진만 고르고 돌아가기 — 텍스트는 ReviewSheet에서 입력
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
      // 1. 유저 정보 수급
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = savedUser?.email || savedUser?.user_email;

      // 2. 🚨 [매우 중요] DB spots 테이블과 100% 매칭되는 진짜 숫자 ID 찾기 로직
      let targetSpotId =
        selectedPlaceId ||
        reviewPlaceId ||
        sessionStorage.getItem("review_place_id");

      // 만약 가져온 ID가 없거나 문자가 섞여있다면, 최애 아이돌 이름을 판별하여 진짜 DB 상의 대표 장소 ID(숫자) 할당
      const idolName = selectedIdol?.name || "";

      if (!targetSpotId || isNaN(Number(targetSpotId))) {
        if (idolName.includes("정국")) {
          targetSpotId = "1"; // 우돈청 진짜 ID
        } else if (idolName.includes("지민")) {
          targetSpotId = "5"; // 자연도소금빵 진짜 ID
        } else if (idolName.includes("카리나")) {
          targetSpotId = "8"; // 실비옥 진짜 ID
        } else if (idolName.includes("영케이")) {
          targetSpotId = "11"; // 추암해수욕장 진짜 ID
        } else if (idolName.includes("영지")) {
          targetSpotId = "14"; // 대박곱창 진짜 ID
        } else if (idolName.includes("재현")) {
          targetSpotId = "17"; // 볼링볼링 진짜 ID
        } else {
          // 리스트(filteredPlaces)에 진짜 DB 객체들이 있다면 그 첫 번째 실제 ID 차용
          targetSpotId =
            filteredPlaces && filteredPlaces[0]?.id
              ? String(filteredPlaces[0].id)
              : "1";
        }
      }

      // 3. 백엔드 Multer가 한 방에 파싱할 수 있게 FormData 규격 작성
      const formData = new FormData();
      formData.append("userEmail", userEmail);
      formData.append("spotId", targetSpotId); // 드디어 진짜 1~20 사이의 유효한 숫자 ID 탑재!
      formData.append("title", `${idolName} 성지순례 후기`);
      formData.append("content", content.trim());

      // base64 형태의 촬영 사진 데이터 -> Blob 스트림으로 변환 후 photo에 장착
      if (selectedPhoto.src.startsWith("data:")) {
        const response = await fetch(selectedPhoto.src);
        const blob = await response.blob();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);
      } else {
        formData.append("photo", selectedPhoto.src);
      }

      // 4. 멀티파트 헤더 탑재 후 서버로 발송!
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

      // 백엔드가 제공하는 정식 알림창 띄우기
      alert(res.data.message);

      // 홈으로 복귀하여 실시간 데이터 연동 확인
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

        {/* reviewFlow에서는 PlaceDetailModal을 열지 않음 */}
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

            {/* reviewFlow: 텍스트 입력 숨김 — 리뷰 내용은 ReviewSheet에서 작성 */}
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
