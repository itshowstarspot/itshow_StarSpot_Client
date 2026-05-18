import styled, { keyframes } from 'styled-components'
import mainLogo from '../assets/logo/main-loge.svg'
import yellowStar from '../assets/logo/yellow-star.png'

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-8deg); }
  50%       { transform: translateY(-12px) rotate(-8deg); }
`
const floatB = keyframes`
  0%, 100% { transform: translateY(0px) rotate(10deg); }
  50%       { transform: translateY(-8px) rotate(10deg); }
`
const floatC = keyframes`
  0%, 100% { transform: translateY(0px) rotate(5deg); }
  50%       { transform: translateY(-6px) rotate(5deg); }
`

/* 배경 오버레이: 살짝 어두워서 카드가 떠보임, 지도는 뒤에 보임 */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.22);
`

/* 카드: 화면 중앙에 떠있는 흰 카드, 위아래로 지도 보임 */
const Card = styled.section`
  position: relative;
  width: min(860px, 88vw);
  background: #ffffff;
  border-radius: 28px;
  padding: 64px 60px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  overflow: visible;
`

/* ── 별 데코 위치 (1번 이미지 기준) ── */

/* 큰 별: 카드 좌상단, 카드 밖으로 튀어나옴 */
const StarA = styled.img`
  position: absolute;
  top: -150px;
  left: -70px;
  width: 347px;
  filter: drop-shadow(0 6px 12px rgba(180,140,20,0.28));
  animation: ${float} 3.4s ease-in-out infinite;
  pointer-events: none;
`

/* 중간 별: 카드 우상단 안쪽 */
const StarB = styled.img`
  position: absolute;
  top: 60px;
  right: 100px;
  width: 80px;
  /* 연한 베이지 톤으로 보이도록 밝기 올림 */
  filter: brightness(1.15) saturate(0.55) drop-shadow(0 4px 8px rgba(180,140,20,0.18));
  animation: ${floatB} 4.2s ease-in-out infinite 0.8s;
  pointer-events: none;
`

/* 작은 별: 카드 우하단, 카드 밖 */
const StarC = styled.img`
  position: absolute;
  bottom: 80px;
  right: -10px;
  width: 72px;
  filter: drop-shadow(0 4px 8px rgba(180,140,20,0.25));
  animation: ${floatC} 3.8s ease-in-out infinite 1.4s;
  pointer-events: none;
`

const Logo = styled.img`
  width: min(420px, 55%);
  object-fit: contain;
`

const StartBtn = styled.button`
  width: min(440px, 60%);
  padding: 35px 0;
  border: none;
  border-radius: 20px;
  background: #f0e88c;
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;

  &:hover {
    background: #e8d664;
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(232, 214, 100, 0.45);
  }

  &:active { transform: translateY(0); }
`

export default function Start({ onStart }) {
  return (
    <Overlay>
      <Card>
        <StarA src={yellowStar} alt="" />
        <StarB src={yellowStar} alt="" />
        <StarC src={yellowStar} alt="" />

        <Logo src={mainLogo} alt="Star Spot" />

        <StartBtn type="button" onClick={onStart}>
          시작하기
        </StartBtn>
      </Card>
    </Overlay>
  )
}
