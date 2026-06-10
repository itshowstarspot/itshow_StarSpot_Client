import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import mainLogo from '../assets/logo/main-logo.png'
import yellowStar from '../assets/logo/yellow-star.png'

const floatA = keyframes`
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-12px) rotate(-8deg); }
`

const floatB = keyframes`
  0%, 100% { transform: translateY(0) rotate(10deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
`

const floatC = keyframes`
  0%, 100% { transform: translateY(0) rotate(5deg); }
  50% { transform: translateY(-6px) rotate(5deg); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1a1c22 0%, #2d2f36 60%, #1e2028 100%);
`

const Card = styled.section`
  position: relative;
  width: min(860px, 88vw);
  padding: 64px 60px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  overflow: visible;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);

  @media (max-width: 700px) {
    width: calc(100vw - 32px);
    padding: 52px 24px 44px;
    gap: 36px;
  }
`

const StarA = styled.img`
  position: absolute;
  top: -150px;
  left: -70px;
  width: 347px;
  filter: drop-shadow(0 6px 12px rgba(180, 140, 20, 0.28));
  animation: ${floatA} 3.4s ease-in-out infinite;
  pointer-events: none;

  @media (max-width: 700px) {
    top: -80px;
    left: -38px;
    width: 190px;
  }
`

const StarB = styled.img`
  position: absolute;
  top: 60px;
  right: 100px;
  width: 80px;
  filter: brightness(1.15) saturate(0.55) drop-shadow(0 4px 8px rgba(180, 140, 20, 0.18));
  animation: ${floatB} 4.2s ease-in-out infinite 0.8s;
  pointer-events: none;

  @media (max-width: 700px) {
    top: 38px;
    right: 34px;
    width: 54px;
  }
`

const StarC = styled.img`
  position: absolute;
  right: -10px;
  bottom: 80px;
  width: 72px;
  filter: drop-shadow(0 4px 8px rgba(180, 140, 20, 0.25));
  animation: ${floatC} 3.8s ease-in-out infinite 1.4s;
  pointer-events: none;

  @media (max-width: 700px) {
    right: 12px;
    bottom: 72px;
    width: 52px;
  }
`

const LogoFrame = styled.div`
  width: min(420px, 55%);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #ffffff;

  @media (max-width: 700px) {
    width: min(300px, 78%);
  }
`

const Logo = styled.img`
  width: 110%;
  height: 110%;
  object-fit: cover;
  display: block;
`

const FeatureRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 700px) { gap: 10px; }
`

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(232, 214, 100, 0.08);
  border: 1px solid rgba(232, 214, 100, 0.2);
  min-width: 80px;

  span:first-child { font-size: 22px; }
  span:last-child  { font-size: 11px; font-weight: 600; color: rgba(45,47,54,0.6); }
`

const StartBtn = styled.button`
  width: min(440px, 60%);
  padding: 35px 0;
  border: none;
  border-radius: 20px;
  background: #f0e88c;
  color: #ffffff;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;

  &:hover {
    background: #e8d664;
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(232, 214, 100, 0.45);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 700px) {
    width: min(320px, 86%);
    padding: 25px 0;
    font-size: 24px;
  }
`

export default function Start() {
  const navigate = useNavigate()
  return (
    <Overlay>
      <Card>
        <StarA src={yellowStar} alt="" />
        <StarB src={yellowStar} alt="" />
        <StarC src={yellowStar} alt="" />
        <LogoFrame>
          <Logo src={mainLogo} alt="Star Spot" />
        </LogoFrame>
        <FeatureRow>
          {[
            { icon: '🗺️', label: '장소 탐색' },
            { icon: '📸', label: '프레임 촬영' },
            { icon: '⭐', label: '즐겨찾기' },
            { icon: '🗒️', label: '코스 관리' },
          ].map(({ icon, label }) => (
            <FeatureCard key={label}>
              <span>{icon}</span>
              <span>{label}</span>
            </FeatureCard>
          ))}
        </FeatureRow>

        <StartBtn type="button" onClick={() => navigate('/login')}>
          시작하기
        </StartBtn>
      </Card>
    </Overlay>
  )
}
