import styled from 'styled-components'
import NavIcons from './NavIcons'
import mainLogo from '../../assets/logo.svg'

const SidebarWrapper = styled.aside`
  display: flex;
  height: 100vh;
  flex-shrink: 0;
`

/* ── 네비게이션 열: 피그마 101px ── */
const NavCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 101px;
  padding: 0 8px 16px;
  background: #ffffff;
  border-right: 1px solid rgba(45, 47, 54, 0.08);
  gap: 4px;
  flex-shrink: 0;

  @media (max-width: 1100px) { width: 80px; }
  @media (max-width: 768px)  { width: 64px; }
`

/* ── 로고 영역: 100x90 per Figma ── */
const LogoBox = styled.div`
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(45, 47, 54, 0.06);
  margin-bottom: 8px;
`

const LogoImg = styled.img`
  width: 64px;
  object-fit: contain;

  @media (max-width: 768px) { width: 44px; }
`

/* ── 프로필 아바타: 75x75 원형 (피그마) ── */
const ProfileWrap = styled.div`
  margin-top: auto;
  padding-top: 8px;
`

const ProfileAvatar = styled.div`
  width: 75px;
  height: 75px;
  border-radius: 50%;
  overflow: hidden;
  background: #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(45, 47, 54, 0.4);
  border: 2.5px solid rgba(232, 214, 100, 0.55);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`

/* ── 콘텐츠 패널: 피그마 405px ── */
const PanelCol = styled.div`
  width: 405px;
  background: #ffffff;
  overflow-y: hidden;
  border-right: 1px solid rgba(45, 47, 54, 0.08);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1300px) { width: 340px; }
  @media (max-width: 1100px) { width: 290px; }
  @media (max-width: 900px)  { width: 260px; }
  @media (max-width: 768px)  {
    width: calc(100vw - 64px);
    position: fixed;
    left: ${({ $open }) => ($open ? '64px' : '-100vw')};
    top: 0;
    bottom: 0;
    z-index: 200;
    box-shadow: 4px 0 20px rgba(0,0,0,0.12);
    transition: left 0.28s ease;
  }
`

export default function Sidebar({ activeNav, onNavSelect, idolImage, panelOpen, children }) {
  return (
    <SidebarWrapper>
      <NavCol>
        <LogoBox>
          <LogoImg src={mainLogo} alt="Star Spot" />
        </LogoBox>

        <NavIcons active={activeNav} onSelect={onNavSelect} />

        <ProfileWrap>
          <ProfileAvatar>
            {idolImage ? (
              <img src={idolImage} alt="선택한 아이돌" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="rgba(45,47,54,0.35)" strokeWidth="1.8" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(45,47,54,0.35)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </ProfileAvatar>
        </ProfileWrap>
      </NavCol>

      <PanelCol $open={panelOpen}>{children}</PanelCol>
    </SidebarWrapper>
  )
}
