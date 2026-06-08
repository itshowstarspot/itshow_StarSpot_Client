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

const PasswordHint = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.4);
  margin: -4px 0 0;
`

const SignupBtn = styled.button`
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
  &:disabled { background: rgba(232,214,100,0.3); color: rgba(45,47,54,0.3); cursor: default; }
`

const ErrorMsg = styled.p`
  font-size: 12px;
  color: #e85050;
  margin: -4px 0 0;
`

const SuccessMsg = styled.p`
  font-size: 12px;
  color: #4a9d8f;
  margin: -4px 0 0;
  text-align: center;
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

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', nickname: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.nickname || !form.password || !form.confirm) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (!form.email.includes('@')) {
      setError('올바른 이메일 형식이 아니에요.')
      return
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.')
      return
    }
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }

    // 실제 API 연동 전 임시 처리
    setSuccess(true)
    setTimeout(() => navigate('/login'), 1500)
  }

  return (
    <Page>
      <Card>
        <Logo src={mainLogo} alt="StarSpot" />
        <Title>회원가입</Title>
        <Sub>StarSpot과 함께 최애를 따라가요 ⭐</Sub>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>이메일</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={set('email')}
            />
          </Field>

          <Field>
            <Label>닉네임</Label>
            <Input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={form.nickname}
              onChange={set('nickname')}
            />
          </Field>

          <Field>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="8자 이상 입력하세요"
              value={form.password}
              onChange={set('password')}
            />
            <PasswordHint>영문, 숫자 포함 8자 이상</PasswordHint>
          </Field>

          <Field>
            <Label>비밀번호 확인</Label>
            <Input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.confirm}
              onChange={set('confirm')}
            />
          </Field>

          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>✓ 가입 완료! 로그인 페이지로 이동합니다.</SuccessMsg>}

          <SignupBtn type="submit" disabled={success}>가입하기</SignupBtn>
        </Form>

        <Divider />

        <Bottom>
          이미 계정이 있으신가요?{' '}
          <span onClick={() => navigate('/login')}>로그인</span>
        </Bottom>
      </Card>
    </Page>
  )
}
