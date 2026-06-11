import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Select from "./pages/Select";
import PlaceDetail from "./pages/PlaceDetail";
import Feed from "./pages/Feed";
import Photo from "./pages/Photo";
import PhotoFrame from "./pages/PhotoFrame";
import PhotoSelect from "./pages/PhotoSelect";
import RoutePage from "./pages/Route";
import Course from "./pages/Course";
import MyPage from "./pages/MyPage";
import PostRegister from "./pages/PostRegister";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  STORAGE_KEY_IDOL,
  STORAGE_KEY_LOGGED_IN,
  STORAGE_KEY_NICKNAME,
  STORAGE_KEY_COURSES,
  STORAGE_KEY_FAVORITES,
  STORAGE_KEY_VISITS,
  STORAGE_KEY_LATEST_POST,
} from "./constants/storageKeys";

/** 로그인 안 된 상태에서 보호된 페이지 접근 시 /login으로 리다이렉트 */
function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function SelectPage({ onSelect }) {
  const navigate = useNavigate();
  return (
    <Select
      onSelect={(idol) => {
        onSelect(idol);
        navigate("/home");
      }}
    />
  );
}

// 🌟 [안전 격리] VisitHistory 컴포넌트를 App 함수 외부 독립된 영역에 선언합니다.
// 이렇게 해야 BrowserRouter 내부 구역에서 안전하게 useNavigate를 호출할 수 있습니다.
function VisitHistory() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: "50px",
        textAlign: "center",
        fontSize: "20px",
        color: "#2d2f36",
        background: "#f5f5f8",
        minHeight: "100vh",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
          background: "#e8d664",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        ← 마이페이지로 돌아가기
      </button>
      <h1 style={{ marginTop: "40px" }}>🎒 방문 기록 페이지 테스트 성공!</h1>
      <p style={{ color: "#666", fontSize: "16px" }}>
        라우터와 네비게이트 연결이 아주 완벽하게 성공했습니다.
      </p>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage(
    STORAGE_KEY_LOGGED_IN,
    false,
  );
  const [selectedIdol, setSelectedIdol] = useLocalStorage(
    STORAGE_KEY_IDOL,
    null,
  );
  const [nickname, setNickname] = useLocalStorage(STORAGE_KEY_NICKNAME, "");
  const [skipHomeIdolPrompt, setSkipHomeIdolPrompt] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 37.4741, lng: 126.9329 });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    const keysToRemove = [
      STORAGE_KEY_IDOL,
      STORAGE_KEY_LOGGED_IN,
      STORAGE_KEY_NICKNAME,
      STORAGE_KEY_COURSES,
      STORAGE_KEY_FAVORITES,
      STORAGE_KEY_VISITS,
      STORAGE_KEY_LATEST_POST,
      "user",
      "selected_idol",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    setSelectedIdol(null);
    setNickname("");
    setIsLoggedIn(false);
    setSkipHomeIdolPrompt(false);
    console.log("🧼 로그아웃 완료: 이전 세션 및 스토리지 데이터 청소 성공!");
  };

  const handleDeleteAccount = () => {
    [
      STORAGE_KEY_IDOL,
      STORAGE_KEY_LOGGED_IN,
      STORAGE_KEY_NICKNAME,
      STORAGE_KEY_COURSES,
      STORAGE_KEY_FAVORITES,
      STORAGE_KEY_VISITS,
      STORAGE_KEY_LATEST_POST,
      "user",
      "selected_idol",
    ].forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    setSelectedIdol(null);
    setNickname("");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
        />
        <Route
          path="/start"
          element={isLoggedIn ? <Navigate to="/home" replace /> : <Start />}
        />

        {/* 공개 페이지 */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onLogin={handleLogin} hasIdol={!!selectedIdol} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <Login
                onLogin={handleLogin}
                hasIdol={!!selectedIdol}
                defaultTab="signup"
              />
            )
          }
        />

        {/* 보호된 페이지 (로그인 필요) */}
        <Route
          path="/select"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <SelectPage
                onSelect={(idol) => {
                  setSelectedIdol(idol);
                  setSkipHomeIdolPrompt(false);
                }}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Home
                selectedIdol={selectedIdol}
                onIdolChange={setSelectedIdol}
                skipIdolPrompt={skipHomeIdolPrompt}
                onLogout={handleLogout}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/place/:id"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PlaceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/photo"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Photo selectedIdol={selectedIdol} />
            </PrivateRoute>
          }
        />
        <Route
          path="/photoframe"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PhotoFrame />
            </PrivateRoute>
          }
        />
        <Route
          path="/photoselect"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PhotoSelect selectedIdol={selectedIdol} />
            </PrivateRoute>
          }
        />

        <Route
          path="/route"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoutePage
                mapCenter={mapCenter}
                onMapCenterChange={setMapCenter}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/post"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PostRegister selectedIdol={selectedIdol} />
            </PrivateRoute>
          }
        />
        <Route
          path="/course"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Course selectedIdol={selectedIdol} />
            </PrivateRoute>
          }
        />

        {/* 🌟 내부 선언된 안전한 VisitHistory 컴포넌트로 연결 */}
        <Route
          path="/visit"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <VisitHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/mypage"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <MyPage
                selectedIdol={selectedIdol}
                onIdolChange={setSelectedIdol}
                nickname={nickname}
                onNicknameChange={setNickname}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/home" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
