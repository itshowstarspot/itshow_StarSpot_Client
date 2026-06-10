import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import mainLogo from "../assets/logo.svg";
import { EyeIcon } from "../components/common/icons";
import { idols } from "../domain/idol/idol"; // 🌟 매칭을 위한 idols 데이터 임포트 추가

// 모듈 레벨에 선언 — 컴포넌트 렌더마다 재생성 방지
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── 애니메이션 ── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── 레이아웃 ── */
const Page = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(145deg, #1a1c22 0%, #2d2f36 60%, #1e2028 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "⭐";
    position: absolute;
    font-size: 320px;
    opacity: 0.03;
    top: -60px;
    right: -60px;
    user-select: none;
    pointer-events: none;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  padding: 40px 36px 36px;
  width: min(420px, 100%);
  animation: ${fadeUp} 0.4s ease;
`;

const LogoRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  gap: 8px;
`;

const LogoImg = styled.img`
  width: 56px;
`;

const AppName = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #2d2f36;
  letter-spacing: -0.5px;
`;

const AppSub = styled.div`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.4);
`;

/* ── 탭 ── */
const TabRow = styled.div`
  display: flex;
  background: #f5f5f8;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
`;

const Tab = styled.button`
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active }) => ($active ? "#fff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2d2f36" : "rgba(45,47,54,0.4)")};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 8px rgba(0,0,0,0.1)" : "none"};
`;

/* ── 폼 공통 ── */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: rgba(45, 47, 54, 0.55);
`;

const InputWrap = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  border: 1.5px solid
    ${({ $error }) => ($error ? "#e85050" : "rgba(45,47,54,0.12)")};
  border-radius: 12px;
  padding: 0 ${({ $hasIcon }) => ($hasIcon ? "44px" : "14px")} 0 14px;
  font-size: 14px;
  color: #2d2f36;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;
  box-sizing: border-box;

  &:focus {
    border-color: #e8d664;
  }
  &::placeholder {
    color: rgba(45, 47, 54, 0.25);
  }
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  color: rgba(45, 47, 54, 0.35);
  &:hover {
    color: #2d2f36;
  }
`;

const ErrorMsg = styled.p`
  font-size: 12px;
  color: #e85050;
  margin: -6px 0 0;
`;

const SubmitBtn = styled.button`
  height: 52px;
  border-radius: 14px;
  border: none;
  background: ${({ disabled }) =>
    disabled ? "rgba(232,214,100,0.35)" : "#e8d664"};
  color: ${({ disabled }) => (disabled ? "rgba(45,47,54,0.35)" : "#1a1a1a")};
  font-size: 15px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  margin-top: 4px;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:not(:disabled):hover {
    background: #d4c250;
  }
`;

const SuccessMsg = styled.div`
  text-align: center;
  padding: 20px 0 4px;
  color: #4a9d8f;
  font-size: 14px;
  font-weight: 600;
`;

/* ── 로그인 폼 ── */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
      );

      if (response.data.success) {
        const loggedInUser = response.data.user;

        // 1. 공통 유저 세션 저장
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        // 2. App.jsx의 useLocalStorage와 완벽 연동을 위해 데이터 전처리 주입
        const favoriteName =
          loggedInUser.favorite_idol || loggedInUser.favoriteIdol;

        if (favoriteName) {
          const matchedIdol = idols.find(
            (i) => i.name === favoriteName || i.id === favoriteName,
          );

          if (matchedIdol) {
            localStorage.setItem("selected_idol", JSON.stringify(matchedIdol));
          }
        }

        if (loggedInUser.nickname) {
          localStorage.setItem("nickname", loggedInUser.nickname);
        }

        // 3. 부모 로그인 상태 플래그 활성화
        onLogin?.();

        console.log(
          `기존 회원 로그인 성공! 최애(${favoriteName}) 상태 세션을 구축하여 지도로 진입합니다. 🚀`,
        );

        // 🌟 [핵심 변경] 리액트 내부 라우팅 대신 하드 네비게이션으로 진입하여 스토리지 동기화 타이밍 버그 원천 박멸
        window.location.href = "/home";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "이메일 또는 비밀번호가 올바르지 않아요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="login-email">이메일</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          $error={!!error}
          autoComplete="email"
          autoFocus
        />
      </Field>

      <Field>
        <Label htmlFor="login-pw">비밀번호</Label>
        <InputWrap>
          <Input
            id="login-pw"
            type={showPw ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            $error={!!error}
            $hasIcon
            autoComplete="current-password"
          />
          <EyeBtn type="button" onClick={() => setShowPw((v) => !v)}>
            <EyeIcon show={showPw} />
          </EyeBtn>
        </InputWrap>
      </Field>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <SubmitBtn type="submit" disabled={isLoading || !email || !password}>
        {isLoading ? "로그인 중..." : "로그인"}
      </SubmitBtn>
    </Form>
  );
}

/* ── 회원가입 폼 ── */
function SignupForm({ onSignupDone }) {
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!EMAIL_REGEX.test(form.email))
      e.email = "올바른 이메일 형식이 아니에요.";
    if (!form.nickname.trim()) e.nickname = "닉네임을 입력해주세요.";
    if (form.password.length < 8)
      e.password = "비밀번호는 8자 이상이어야 해요.";
    if (form.password !== form.confirm)
      e.confirm = "비밀번호가 일치하지 않아요.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/signup",
        {
          email: form.email,
          nickname: form.nickname,
          password: form.password,
          favorite_idol: null,
        },
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => onSignupDone?.(), 1400);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err.response?.data?.message || "회원가입에 실패했어요.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return <SuccessMsg>✓ 가입 완료! 로그인해주세요 🎉</SuccessMsg>;
  }

  const isReady = form.email && form.nickname && form.password && form.confirm;

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="su-email">이메일</Label>
        <Input
          id="su-email"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={set("email")}
          $error={!!errors.email}
          autoComplete="email"
          autoFocus
        />
        {errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
      </Field>

      <Field>
        <Label htmlFor="su-nick">닉네임</Label>
        <Input
          id="su-nick"
          type="text"
          placeholder="사용할 닉네임을 입력하세요"
          value={form.nickname}
          onChange={set("nickname")}
          $error={!!errors.nickname}
          autoComplete="nickname"
        />
        {errors.nickname && <ErrorMsg>{errors.nickname}</ErrorMsg>}
      </Field>

      <Field>
        <Label htmlFor="su-pw">비밀번호</Label>
        <InputWrap>
          <Input
            id="su-pw"
            type={showPw ? "text" : "password"}
            placeholder="8자 이상 입력하세요"
            value={form.password}
            onChange={set("password")}
            $error={!!errors.password}
            $hasIcon
            autoComplete="new-password"
          />
          <EyeBtn type="button" onClick={() => setShowPw((v) => !v)}>
            <EyeIcon show={showPw} />
          </EyeBtn>
        </InputWrap>
        {errors.password && <ErrorMsg>{errors.password}</ErrorMsg>}
      </Field>

      <Field>
        <Label htmlFor="su-confirm">비밀번호 확인</Label>
        <InputWrap>
          <Input
            id="su-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="비밀번호를 다시 입력하세요"
            value={form.confirm}
            onChange={set("confirm")}
            $error={!!errors.confirm}
            $hasIcon
            autoComplete="new-password"
          />
          <EyeBtn type="button" onClick={() => setShowConfirm((v) => !v)}>
            <EyeIcon show={showConfirm} />
          </EyeBtn>
        </InputWrap>
        {errors.confirm && <ErrorMsg>{errors.confirm}</ErrorMsg>}
      </Field>

      <SubmitBtn type="submit" disabled={isLoading || !isReady}>
        {isLoading ? "가입 중..." : "가입하기"}
      </SubmitBtn>
    </Form>
  );
}

/* ── 메인 컴포넌트 ── */
export default function Login({
  onLogin,
  hasIdol = false,
  defaultTab = "login",
}) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <Page>
      <Card>
        <LogoRow>
          <LogoImg src={mainLogo} alt="StarSpot" />
          <AppName>StarSpot</AppName>
          <AppSub>최애의 발자취를 따라가보세요 ⭐</AppSub>
        </LogoRow>

        <TabRow>
          <Tab $active={tab === "login"} onClick={() => setTab("login")}>
            로그인
          </Tab>
          <Tab $active={tab === "signup"} onClick={() => setTab("signup")}>
            회원가입
          </Tab>
        </TabRow>

        {tab === "login" ? (
          <LoginForm onLogin={onLogin} hasIdol={hasIdol} />
        ) : (
          <SignupForm onSignupDone={() => setTab("login")} />
        )}
      </Card>
    </Page>
  );
}
