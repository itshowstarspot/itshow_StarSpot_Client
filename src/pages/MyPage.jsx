import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import IdolSelectModal from "../components/IdolSelectModal";
import ProfileCard from "../components/mypage/ProfileCard";
import FavoritesSection from "../components/mypage/FavoritesSection";
import MyCoursesSection from "../components/mypage/MyCoursesSection";
import QuickNavSection from "../components/mypage/QuickNavSection";
import AccountSection from "../components/mypage/AccountSection";
import { idols } from "../domain/idol/idol";

const Page = styled.main`
  position: relative;
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

// 🌟 구조 분해 할당 목록에 App.jsx가 내려주는 'onNicknameChange'를 정확히 수급합니다.
export default function MyPage({
  onLogout,
  onDeleteAccount,
  onIdolChange,
  onNicknameChange,
}) {
  const navigate = useNavigate();

  const [currentNickname, setCurrentNickname] = useState("사용자");
  const [currentIdol, setCurrentIdol] = useState(null);
  const [showIdolModal, setShowIdolModal] = useState(false);

  // 마운트 시 데이터 세션 동기화
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userObj = JSON.parse(savedUser);

        if (userObj && userObj.nickname) {
          setCurrentNickname(userObj.nickname);
        }

        if (userObj && userObj.favorite_idol) {
          const matchedIdol = idols.find(
            (i) =>
              i.name === userObj.favorite_idol ||
              i.id === userObj.favorite_idol,
          );
          setCurrentIdol(matchedIdol || null);
        }
      }
    } catch (err) {
      console.error("마이페이지 초기 로드 중 로컬스토리지 파싱 에러:", err);
    }
  }, []);

  // 닉네임 변경 핸들러 + 백엔드 DB 연동 (오타 및 흐름 완벽 수정 ✨)
  const handleNicknameChange = async (newNick) => {
    if (!newNick || !newNick.trim()) return;

    setCurrentNickname(newNick);

    // 🌟 App.jsx 전역 상태 동기화 (기존의 props. 에러 제거)
    if (onNicknameChange) {
      onNicknameChange(newNick);
    }

    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const userObj = JSON.parse(savedUser);
      userObj.nickname = newNick;
      localStorage.setItem("user", JSON.stringify(userObj));

      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;

      await axios.put(`http://localhost:5000/api/users/profile`, {
        userId: userId,
        email: userEmail,
        nickname: newNick,
        favorite_idol: userObj.favorite_idol,
      });

      console.log("마이페이지에서 닉네임 변경 및 DB 반영 완료! 🔄📛");
    } catch (err) {
      console.error("마이페이지 닉네임 DB 업데이트 실패:", err);
    }
  };

  // 최애 아이돌 변경 핸들러 + 백엔드 DB 연동
  const handleIdolSelect = async (idol) => {
    if (!idol) return;

    setCurrentIdol(idol);
    setShowIdolModal(false);

    if (onIdolChange) {
      onIdolChange(idol);
    }

    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const userObj = JSON.parse(savedUser);
      userObj.favorite_idol = idol.name;
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("selected_idol", JSON.stringify(idol));

      const userId = userObj.id || userObj.user_id;
      const userEmail = userObj.email || userObj.user_email;

      await axios.put(`http://localhost:5000/api/users/profile`, {
        userId: userId,
        email: userEmail,
        favorite_idol: idol.name,
      });

      console.log("마이페이지에서 최애 아이돌 변경 및 DB 반영 완료! 🔄⭐");
    } catch (err) {
      console.error("마이페이지 최애 아이돌 DB 업데이트 실패:", err);
    }
  };

  // 로그아웃 핸들러
  const handleLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("selected_idol");
      if (onLogout) onLogout();
      navigate("/");
    }
  };

  // 계정 탈퇴 핸들러 + 백엔드 DB 연동
  const handleDeleteAccountClick = async () => {
    if (
      window.confirm("정말로 탈퇴하시겠습니까? 모든 데이터가 영구 삭제됩니다.")
    ) {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return;

      try {
        const userObj = JSON.parse(savedUser);
        const targetIdentifier =
          userObj.id || userObj.user_id || userObj.email || userObj.user_email;

        await axios.delete(
          `http://localhost:5000/api/users/${targetIdentifier}`,
        );
        alert("탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");

        localStorage.removeItem("user");
        localStorage.removeItem("selected_idol");
        if (onDeleteAccount) onDeleteAccount();
        navigate("/");
      } catch (err) {
        console.error("회원 탈퇴 처리 실패:", err);
        alert("회원 탈퇴 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>마이페이지</PageTitle>
      </TopBar>

      <Content>
        <ProfileCard
          idol={currentIdol}
          nickname={currentNickname}
          onNicknameChange={handleNicknameChange}
          onChangeClick={() => setShowIdolModal(true)}
        />

        <FavoritesSection onMapClick={() => navigate("/home")} />

        <MyCoursesSection
          onCourseClick={() => navigate("/course")}
          onCreateClick={() => navigate("/course")}
        />

        <QuickNavSection onNavigate={(key) => navigate(`/${key}`)} />

        <AccountSection
          onLogout={handleLogoutClick}
          onDeleteAccount={handleDeleteAccountClick}
        />
      </Content>

      <IdolSelectModal
        isOpen={showIdolModal}
        idols={idols || []}
        onSelect={handleIdolSelect}
        onClose={() => setShowIdolModal(false)}
      />
    </Page>
  );
}
