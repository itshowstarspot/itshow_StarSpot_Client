import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
`;

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0;
`;

const Content = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }
`;

const RefreshBtn = styled.button`
  background: #ffffff;
  border: 1px solid rgba(45, 47, 54, 0.1);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #7e838f;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f8;
    color: #2d2f36;
  }
`;

const EmptyCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #7e838f;
  margin: 0;
  line-height: 1.5;
`;

const VisitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VisitCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PlaceName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #2d2f36;
`;

const MemberName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #e8d664;
  background: rgba(232, 214, 100, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
`;

const VisitDate = styled.span`
  font-size: 12px;
  color: #a1a7b5;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #a1a7b5;
  padding: 20px;
  font-size: 14px;
`;

export default function VisitHistory() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitHistory = () => {
    let userEmail = "test15@gmail.com";

    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        userEmail = userObj.email || userObj.user_email || userEmail;
      }
    } catch (e) {
      console.error("유저 세션 파싱 에러:", e);
    }

    setLoading(true);

    axios
      .get(`http://localhost:5000/api/users/visit-history/${userEmail}`)
      .then((res) => {
        setVisits(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("방문 기록 데이터 로드 실패:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVisitHistory();
  }, []);

  // 🛡️ [추가] 안전하게 장소 상세페이지로 네비게이션하는 헬퍼 함수
  const handleCardClick = (item) => {
    if (!item) return;

    // 백엔드 데이터에 혼재할 수 있는 모든 ID 네이밍 규칙 다각도로 필터링
    const finalPlaceId =
      item.placeId || item.place_id || item.id || item.spotId || item._id;

    if (
      finalPlaceId &&
      String(finalPlaceId) !== "undefined" &&
      String(finalPlaceId).trim() !== ""
    ) {
      navigate(`/place/${finalPlaceId}`);
    } else {
      console.error(
        "❌ 이 아이템에서 유효한 장소 ID를 추출할 수 없습니다. 데이터 구조 확인 필요:",
        item,
      );
      alert("장소 ID를 가져올 수 없어 상세 페이지로 이동할 수 없습니다.");
    }
  };

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>방문 기록</PageTitle>
      </TopBar>

      <Content>
        <SectionTitle>
          <h2>📸 내가 다녀온 성지 순례</h2>
          <RefreshBtn onClick={fetchVisitHistory}>새로고침 🔄</RefreshBtn>
        </SectionTitle>

        {loading ? (
          <LoadingText>기록을 불러오는 중입니다... ⏳</LoadingText>
        ) : (
          <>
            {visits.length === 0 ? (
              <EmptyCard>
                <EmptyIcon>🎒</EmptyIcon>
                <EmptyText>
                  아직 방문 인증한 장소가 없어요.
                  <br />
                  지도를 보고 나만의 발자국을 남겨보세요!
                </EmptyText>
              </EmptyCard>
            ) : (
              <VisitList>
                {visits.map((item, index) => (
                  <VisitCard
                    key={item.id || index}
                    onClick={() => handleCardClick(item)} // ⭕ 안전한 핸들러로 전면 대체
                  >
                    {item.member_name && (
                      <MemberName>{item.member_name}</MemberName>
                    )}
                    <PlaceName>{item.place_name}</PlaceName>
                    <VisitDate>방문 일시: {item.date}</VisitDate>
                  </VisitCard>
                ))}
              </VisitList>
            )}
          </>
        )}
      </Content>
    </Page>
  );
}
