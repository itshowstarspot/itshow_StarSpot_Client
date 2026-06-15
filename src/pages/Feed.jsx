import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FeedCard from "../components/feed/FeedCard";
import FilterTag from "../components/common/FilterTag";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { fetchFeeds, createFeed, deleteFeed, updateFeed } from "../services/feedService";
import { feedSortOptions } from "../domain/feed/feed";

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
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  background: #f5f5f8;
  border: 1px solid rgba(45, 47, 54, 0.15);
  border-radius: 8px;
  padding: 12px;
  color: #2d2f36;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 12px;
  line-height: 1.5;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45, 47, 54, 0.35); }
`;

const SelectPlace = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(45, 47, 54, 0.15);
  background: #ffffff;
  color: #2d2f36;
  font-size: 14px;
  margin-bottom: 12px;
  outline: none;

  &:focus { border-color: #e8d664; }
`;

const MediaUploadArea = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 2px dashed rgba(45, 47, 54, 0.2);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f8;
  transition: border-color 0.15s;
  position: relative;

  &:hover { border-color: #e8d664; }

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(45, 47, 54, 0.35);
  font-size: 13px;
  pointer-events: none;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ErrorMsg = styled.p`
  font-size: 13px;
  color: #e85050;
  margin: 0 0 8px;
`;

const PLACE_OPTIONS = [
  { id: "1",  name: "우돈청 (정국 성지)" },
  { id: "5",  name: "자연도소금빵 (지민 성지)" },
  { id: "8",  name: "실비옥 (카리나 성지)" },
  { id: "11", name: "추암해수욕장 (영케이 성지)" },
  { id: "14", name: "대박곱창 (영지 성지)" },
  { id: "17", name: "볼링볼링 (재현 성지)" },
];

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export default function Feed() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [feeds, setFeeds] = useState([]);
  const [sort, setSort] = useState("latest");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("1");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [postError, setPostError] = useState(null);

  // 수정 모드
  const [editingFeed, setEditingFeed] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState(null);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);

    if (file.type.startsWith("video/")) {
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = (e) => {
    e.stopPropagation();
    if (mediaPreview && mediaType === "video") {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType("image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setContent("");
    setSelectedPlaceId("1");
    handleRemoveMedia({ stopPropagation: () => {} });
    setPostError(null);
  };

  const loadFeeds = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      const currentUserEmail = user?.email || user?.user_email || "test15@gmail.com";
      const data = await fetchFeeds({ sort, userEmail: currentUserEmail });
      // 서버에서 이미 필터링되어 오지만, 혹시 모를 타인 데이터 방어
      const myFeeds = (data || []).filter((f) => f.userEmail === currentUserEmail);
      setFeeds(myFeeds);
    } catch (err) {
      console.error("[Feed] 피드 로딩 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const handlePost = async () => {
    if (!content.trim()) {
      setPostError("내용을 입력해주세요.");
      return;
    }
    setIsPosting(true);
    setPostError(null);

    try {
      const user = getCurrentUser();
      const currentUserEmail = user?.email || user?.user_email || "test15@gmail.com";
      const nickname = user?.nickname || "익명";

      await createFeed({
        placeId: selectedPlaceId,
        image: mediaType === "image" ? (mediaPreview ?? "") : "",
        mediaFile: mediaType === "video" ? mediaFile : null,
        content,
        userEmail: currentUserEmail,
        nickname,
      });

      await loadFeeds();
      handleCloseModal();
      alert("방문 후기와 방문 기록이 함께 등록되었습니다!");
    } catch (err) {
      setPostError(err.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (feedId) => {
    if (!window.confirm("이 후기를 삭제하시겠습니까?")) return;
    try {
      await deleteFeed(feedId);
      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEditOpen = (feed) => {
    setEditingFeed(feed);
    setEditContent(feed.content);
    setEditError(null);
  };

  const handleEditClose = () => {
    setEditingFeed(null);
    setEditContent("");
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      setEditError("내용을 입력해주세요.");
      return;
    }
    setIsUpdating(true);
    setEditError(null);
    try {
      await updateFeed(editingFeed.id, editContent);
      setFeeds((prev) =>
        prev.map((f) => f.id === editingFeed.id ? { ...f, content: editContent } : f)
      );
      handleEditClose();
    } catch (err) {
      setEditError(err.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Page>
      <TopBar>
        <TopLeft>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Title>내 피드</Title>
        </TopLeft>
        <Button size="sm" onClick={() => setShowModal(true)}>
          + 글 작성
        </Button>
      </TopBar>

      <Content>
        <FilterRow>
          {feedSortOptions.map((opt) => (
            <FilterTag
              key={opt.value}
              label={opt.label}
              active={sort === opt.value}
              onClick={() => setSort(opt.value)}
            />
          ))}
        </FilterRow>

        {isLoading && <LoadingSpinner />}
        {!isLoading && feeds.length === 0 && (
          <EmptyState icon="📝" message="아직 피드가 없어요. 첫 번째 후기를 남겨보세요!" />
        )}
        <FeedGrid>
          {feeds.map((f, idx) => (
            <FeedCard
              key={f.id || idx}
              image={f.image}
              placeName={f.placeName}
              content={f.content}
              createdAt={f.createdAt}
              onEdit={() => handleEditOpen(f)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </FeedGrid>
      </Content>

      {/* 작성 모달 */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleMediaChange}
        />
        <h2 style={{ color: "#2d2f36", marginBottom: 16 }}>방문 후기 작성</h2>

        <label style={{ fontSize: "13px", fontWeight: "600", color: "#7e838f", display: "block", marginBottom: "6px" }}>
          📍 다녀온 성지 장소 선택
        </label>
        <SelectPlace value={selectedPlaceId} onChange={(e) => setSelectedPlaceId(e.target.value)}>
          {PLACE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </SelectPlace>

        <MediaUploadArea onClick={() => fileInputRef.current?.click()}>
          {mediaPreview ? (
            <>
              {mediaType === "video"
                ? <video src={mediaPreview} muted playsInline />
                : <img src={mediaPreview} alt="첨부 미디어" />
              }
              <RemoveMediaBtn onClick={handleRemoveMedia}>✕</RemoveMediaBtn>
            </>
          ) : (
            <MediaPlaceholder>
              <span style={{ fontSize: 28 }}>📷</span>
              <span>탭하여 사진/동영상 선택</span>
            </MediaPlaceholder>
          )}
        </MediaUploadArea>

        <Textarea
          placeholder="방문 후기를 작성해주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
        />
        {postError && <ErrorMsg>{postError}</ErrorMsg>}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="secondary" fullWidth onClick={handleCloseModal}>취소</Button>
          <Button fullWidth style={{ color: "#ffffff" }} onClick={handlePost} disabled={!content.trim() || isPosting}>
            {isPosting ? "등록 중..." : "등록"}
          </Button>
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal isOpen={!!editingFeed} onClose={handleEditClose}>
        <h2 style={{ color: "#2d2f36", marginBottom: 16 }}>후기 수정</h2>
        <Textarea
          placeholder="수정할 내용을 입력해주세요..."
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          maxLength={500}
        />
        {editError && <ErrorMsg>{editError}</ErrorMsg>}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button variant="secondary" fullWidth onClick={handleEditClose}>취소</Button>
          <Button fullWidth style={{ color: "#ffffff" }} onClick={handleUpdate} disabled={!editContent.trim() || isUpdating}>
            {isUpdating ? "수정 중..." : "수정 완료"}
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
