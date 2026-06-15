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
import VisitHistory from "./pages/VisitHistory"; // 🌟 다시 외부 진짜 파일로 명확히 소급!
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
            <RoutePage />
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

        {/* 🌟 외부 컴포넌트 파일과 철저하게 라우팅 연결 완료 */}
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
