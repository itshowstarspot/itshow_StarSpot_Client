import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PostRegister.css";
import MapView from "../components/layout/MapView";
import Sidebar from "../components/sidebar/Sidebar";
import ActivePanel from "../components/sidebar/ActivePanel";
import PlaceDetailModal from "../components/place/PlaceDetailModal";
import { CloseIcon, BackIcon } from "../components/common/icons";
import { usePlaces } from "../hooks/usePlaces";
import { STORAGE_KEY_LATEST_POST } from "../constants/storageKeys";

const readLatestPost = () => {
  try {
    const savedPost = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY_LATEST_POST) || "null",
    );
    if (!savedPost?.title || !savedPost?.image) return null;
    return savedPost;
  } catch {
    return null;
  }
};

export default function PostRegister({ selectedIdol, onReturnHome }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState("search");
  const [postQuery, setPostQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [latestPost] = useState(() => location.state?.post || readLatestPost());
  const { filteredPlaces } = usePlaces(selectedIdol?.id);

  const posts = useMemo(() => {
    const primaryPost = latestPost
      ? {
          id: "latest",
          image: latestPost.image,
          date: latestPost.date,
          title: latestPost.title,
        }
      : null;

    // 실제 등록한 게시물만 표시 (더미 제거)
    return primaryPost ? [primaryPost] : [];
  }, [latestPost]);

  const filteredPosts = useMemo(() => {
    const keyword = postQuery.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => post.title.toLowerCase().includes(keyword));
  }, [posts, postQuery]);

  return (
    <main className="post-register-page">
      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        idolImage={selectedIdol?.profile}
        panelOpen={false}
      >
        <ActivePanel
          navId={activeNav}
          selectedIdol={selectedIdol}
          onPlaceClick={(id) => setSelectedPlaceId(id)}
        />
      </Sidebar>

      <section className="post-register-map">
        <MapView
          places={filteredPlaces}
          onPlaceClick={(id) => setSelectedPlaceId(id)}
        />
        <div className="post-register-map-dim" />

        {selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}

        <section className="post-register-modal" aria-label="등록된 게시물">
          <button
            className="post-register-close"
            type="button"
            aria-label="닫기"
            onClick={() => {
              onReturnHome?.();
              navigate("/home");
            }}
          >
            <CloseIcon />
          </button>

          {selectedPost ? (
            <div className="post-register-detail">
              <button
                className="post-register-back"
                type="button"
                aria-label="목록으로 돌아가기"
                onClick={() => setSelectedPost(null)}
              >
                <BackIcon />
              </button>

              <article className="post-register-detail-card">
                {selectedPost.image ? (
                  <img src={selectedPost.image} alt="" />
                ) : (
                  <div className="post-register-detail-placeholder" />
                )}
                <time>{selectedPost.date}</time>
                <strong>{selectedPost.title}</strong>
              </article>
            </div>
          ) : (
            <>
              <input
                className="post-register-modal-search"
                value={postQuery}
                onChange={(event) => setPostQuery(event.target.value)}
                aria-label="게시물 검색"
              />

              <div className="post-register-grid">
                {filteredPosts.map((post) => (
                  <button
                    className="post-register-post-card"
                    type="button"
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.image ? (
                      <img src={post.image} alt="" />
                    ) : (
                      <div className="post-register-placeholder" />
                    )}
                    <time>{post.date}</time>
                    <strong>{post.title}</strong>
                  </button>
                ))}
              </div>

              <button
                className="post-register-add"
                type="button"
                aria-label="게시물 추가"
                onClick={() =>
                  navigate("/photo", { state: { spotId: selectedPlaceId } })
                } // 🌟 현재 선택된 장소 ID를 state로 토스!
              >
                +
              </button>
            </>
          )}
        </section>

        <div className="post-register-map-actions">
          <button
            type="button"
            onClick={() =>
              navigate("/photo", { state: { spotId: selectedPlaceId } })
            } // 🌟 똑같이 장소 ID 토스!
            title="사진 찍기"
          >
            📷
          </button>
          <button
            type="button"
            onClick={() => navigate("/visit")}
            title="방문 기록"
          >
            📍
          </button>
        </div>
      </section>
    </main>
  );
}
