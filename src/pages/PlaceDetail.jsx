import { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import PlaceDetailCard from "../components/place/PlaceDetailCard";
import FeedCard from "../components/feed/FeedCard";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import { fetchPlaceDetail } from "../services/placeService";
import { fetchFeeds } from "../services/feedService";
import { useFavorites } from "../hooks/useFavorites";

const Page = styled.main`
  min-height: 100vh;
  background: #f5f5f8;
  color: #2d2f36;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45, 47, 54, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
`;

const PageTitle = styled.h1`
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
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
`;

const VisitPhotos = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const VisitPhoto = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background: #d9d9d9;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/**
 * 장소 상세 페이지 (중복 선언 통합 완료)
 */
export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, checkFavorite } = useFavorites();

  const [place, setPlace] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🛡️ [강력 방어] URL 파라미터가 아예 없거나 'undefined' 텍스트일 때 즉시 홈으로 리다이렉트
  useEffect(() => {
    if (!id || id === "undefined" || id.trim() === "") {
      console.warn(
        "❌ 유효하지 않은 장소 ID가 포착되어 홈으로 강제 리다이렉트합니다.",
      );
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    const load = async () => {
      // 주소 검증 단계 통과 여부 확인
      if (!id || id === "undefined") {
        setError(
          "유효하지 않은 장소 요청입니다. 올바른 경로로 다시 접근해 주세요.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [placeData, feedData] = await Promise.all([
          fetchPlaceDetail(id),
          fetchFeeds({ placeId: id }),
        ]);

        if (!placeData) {
          setError("장소 상세 정보를 찾을 수 없습니다.");
          return;
        }

        setPlace(placeData);
        setFeeds(feedData || []);
      } catch (err) {
        setError(err.message || "데이터를 불러오는 중 에러가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  if (isLoading) return <LoadingSpinner padding="40vh" />;

  if (error) {
    return (
      <Page>
        <TopBar>
          <BackBtn onClick={() => navigate("/")}>←</BackBtn>
          <PageTitle>오류 발생</PageTitle>
        </TopBar>
        <Content style={{ paddingTop: "60px" }}>
          <EmptyState icon="⚠️" message={error} />
        </Content>
      </Page>
    );
  }

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>장소 상세</PageTitle>
      </TopBar>

      <Content>
        {place && (
          <PlaceDetailCard
            place={place}
            isFavorite={checkFavorite(place.id)}
            onFavorite={() => toggleFavorite(place.id)}
            onRoute={() => {
              navigate(`/?mode=route&placeId=${place.id}`);
            }}
          />
        )}

        {/* 방문 사진 */}
        <div>
          <SectionTitle>📸 방문 사진</SectionTitle>
          <VisitPhotos>
            {feeds
              .filter((f) => f.image)
              .slice(0, 5)
              .map((f) => (
                <VisitPhoto key={f.id}>
                  <img src={f.image} alt={f.placeName} />
                </VisitPhoto>
              ))}
            {feeds.filter((f) => f.image).length === 0 && (
              <EmptyState icon="📷" message="아직 사진이 없어요." />
            )}
          </VisitPhotos>
        </div>

        {/* 팬 피드 */}
        <div>
          <SectionTitle>
            💬 팬 피드
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/feed")}
            >
              피드 작성
            </Button>
          </SectionTitle>
          {feeds.length === 0 ? (
            <EmptyState icon="✍️" message="첫 번째 방문 후기를 작성해보세요!" />
          ) : (
            <FeedGrid>
              {feeds.map((f) => (
                <FeedCard
                  key={f.id}
                  image={f.image}
                  placeName={f.placeName}
                  content={f.content}
                  viewCount={f.viewCount}
                  createdAt={f.createdAt}
                />
              ))}
            </FeedGrid>
          )}
        </div>
      </Content>
    </Page>
  );
}
