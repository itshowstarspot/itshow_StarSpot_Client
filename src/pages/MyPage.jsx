import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import IdolSelectModal from "../components/IdolSelectModal";
import ProfileCard from "../components/mypage/ProfileCard";
import FavoritesSection from "../components/mypage/FavoritesSection";
import MyCoursesSection from "../components/mypage/MyCoursesSection";
import QuickNavSection from "../components/mypage/QuickNavSection";
import AccountSection from "../components/mypage/AccountSection";
import { idols } from "../domain/idol/idol";
import axios from "axios"; //


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
  gap: 28px;
`;

export default function MyPage({ onLogout, onDeleteAccount }) {
  const navigate = useNavigate();

  // 🌟 로컬 상태로 독립 관리
  const [currentNickname, setCurrentNickname] = useState("사용자");
  const [currentIdol, setCurrentIdol] = useState(null);
  const [showIdolModal, setShowIdolModal] = useState(false);

  // 🌟 [수정] 오직 마운트 시 데이터 동기화만 담당 (자동 팝업 로직 완전 차단)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);

      // 1. 회원가입/로그인 때 받아온 진짜 닉네임 바인딩
      if (userObj.nickname) {
        setCurrentNickname(userObj.nickname);
      }

      // 2. 홈(지도) 화면 모달에서 선택해서 보관해 둔 최애 아이돌 데이터 바인딩
      if (userObj.favorite_idol) {
        const matchedIdol = idols.find(
          (i) =>
            i.name === userObj.favorite_idol || i.id === userObj.favorite_idol,
        );
        setCurrentIdol(matchedIdol || null);
      }
    }
  }, []);

  // 🌟 닉네임 변경 핸들러 보완
  const handleNicknameChange = (newNick) => {
    setCurrentNickname(newNick);

    // 로컬스토리지 데이터도 업데이트
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      userObj.nickname = newNick;
      localStorage.setItem("user", JSON.stringify(userObj));
    }
  };

  // 🌟 MyPage.jsx 내부의 handleIdolSelect 함수를 이 코드로 통째로 덮어씌우세요!
  const handleIdolSelect = async (idol) => {
    // 1. 마이페이지 UI 상태 즉시 변경
    setCurrentIdol(idol);
    setShowIdolModal(false);

    // 2. 로컬스토리지 데이터 업데이트
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    const userObj = JSON.parse(savedUser);
    userObj.favorite_idol = idol.name;
    localStorage.setItem("user", JSON.stringify(userObj));

    // 🌟 [핵심] 3. 마이페이지에서 변경한 최애 아이돌을 백엔드 DB에 실시간 반영
    try {
      // 로컬스토리지 내에 저장된 구조에 맞춰 id와 email을 안전하게 추출합니다.
      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;

      await axios.put(`http://localhost:5000/api/users/profile`, {
        userId: userId,
        email: userEmail, // 백엔드 복합 쿼리 대응용 email 추가
        favorite_idol: idol.name,
      });

      console.log("마이페이지에서 최애 아이돌 변경 및 DB 반영 완료! 🔄⭐");
    } catch (err) {
      console.error("마이페이지 최애 아이돌 DB 업데이트 실패:", err);
    }
  };

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>마이페이지</PageTitle>
      </TopBar>

      <Content>
        {/* 프로필 — 로컬 상태값 바인딩 */}
        <ProfileCard
          idol={currentIdol}
          nickname={currentNickname}
          onNicknameChange={handleNicknameChange}
          onChangeClick={() => setShowIdolModal(true)}
        />

        {/* 즐겨찾기 */}
        <FavoritesSection onMapClick={() => navigate("/home")} />

        {/* 내 코스 */}
        <MyCoursesSection
          onCourseClick={() => navigate("/course")}
          onCreateClick={() => navigate("/course")}
        />

        {/* 방문기록 / 피드 링크 */}
        <QuickNavSection onNavigate={(key) => navigate(`/${key}`)} />

        {/* 로그아웃 / 계정 탈퇴 */}
        <AccountSection onLogout={onLogout} onDeleteAccount={onDeleteAccount} />
      </Content>

      {/* 최애 선택 모달 */}
      <IdolSelectModal
        isOpen={showIdolModal}
        idols={idols}
        onSelect={handleIdolSelect}
      />
    </Page>
  );
}
