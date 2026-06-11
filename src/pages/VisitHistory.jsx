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

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
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
`;

const PlaceName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #2d2f36;
`;

const VisitDate = styled.span`
  font-size: 12px;
  color: #a1a7b5;
`;

export default function VisitHistory() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    // 로컬스토리지나 백엔드에서 방문 기록 들고오기 (예외 방어)
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const userObj = JSON.parse(savedUser);

      // 🌟 [백엔드 연동부] 나중에 DB 테이블 완성되면 주석 해제해서 연동하세요!
      /*
      const userId = userObj.id || userObj.user_id;
      axios.get(`http://localhost:5000/api/visits/${userId}`)
        .then(res => setVisits(res.data))
        .catch(err => console.error("방문기록 로드 실패:", err));
      */

      // 임시Mock 데이터 테스트용 (데이터가 들어왔을 때 UI 확인용)
      // setVisits([{ id: 1, name: "서울시어린이대공원휴게소", date: "2026-06-11" }]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>방문 기록</PageTitle>
      </TopBar>

      <Content>
        <SectionTitle>📸 내가 다녀온 성지 순례</SectionTitle>

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
            {visits.map((item) => (
              <VisitCard key={item.id}>
                <PlaceName>{item.name}</PlaceName>
                <VisitDate>방문 일시: {item.date}</VisitDate>
              </VisitCard>
            ))}
          </VisitList>
        )}
      </Content>
    </Page>
  );
}
