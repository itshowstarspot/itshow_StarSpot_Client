import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import mainLogo from '../assets/logo.svg'

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  background: #fafaf7;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Card = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.09);
  padding: 48px 44px 40px;
  width: min(420px, 90vw);
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Logo = styled.img`
  width: 64px;
  margin-bottom: 8px;
`

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 4px;
`

const Sub = styled.p`
  font-size: 13px;
  color: rgba(45,47,54,0.45);
  margin-bottom: 32px;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: rgba(45,47,54,0.6);
`

const Input = styled.input`
  height: 46px;
  border: 1.5px solid rgba(45,47,54,0.12);
  border-radius: 10px;
  padding: 0 14px;
  font-size: 14px;
  color: #2d2f36;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.25); }
`

const LoginBtn = styled.button`
  height: 50px;
  border-radius: 12px;
  border: none;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.15s;

  &:hover { background: #d4c250; }
`

const ErrorMsg = styled.p`
  font-size: 12px;
  color: #e85050;
  margin: -4px 0 0;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(45,47,54,0.08);
  margin: 20px 0;
`

const Bottom = styled.div`
  font-size: 13px;
  color: rgba(45,47,54,0.5);
  text-align: center;

  span {
    color: #e8b664;
    font-weight: 700;
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
`

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    if (!email.includes('@')) {
      setError('올바른 이메일 형식이 아니에요.')
      return
    }

    // 실제 API 연동 전 임시 처리
    onLogin?.()
    navigate('/home')
  }

  return (
    <Page>
      <Card>
        <Logo src={mainLogo} alt="StarSpot" />
        <Title>로그인</Title>
        <Sub>최애의 발자취를 따라가보세요 ⭐</Sub>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>이메일</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <LoginBtn type="submit">로그인</LoginBtn>
        </Form>

        <Divider />

        <Bottom>
          아직 계정이 없으신가요?{' '}
          <span onClick={() => navigate('/signup')}>회원가입</span>
        </Bottom>
      </Card>
    </Page>
  )
}
