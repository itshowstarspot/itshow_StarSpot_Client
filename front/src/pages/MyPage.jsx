import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import IdolSelectModal from '../components/IdolSelectModal'
import ProfileCard from '../components/mypage/ProfileCard'
import FavoritesSection from '../components/mypage/FavoritesSection'
import MyCoursesSection from '../components/mypage/MyCoursesSection'
import QuickNavSection from '../components/mypage/QuickNavSection'
import { idols } from '../domain/idol/idol'

const Page = styled.main`
  min-height: 100vh;
  background: #f5f5f8;
  color: #2d2f36;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
`

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0;
`

const Content = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

export default function MyPage({ selectedIdol, onIdolChange }) {
  const navigate = useNavigate()
  const [showIdolModal, setShowIdolModal] = useState(false)

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <PageTitle>마이페이지</PageTitle>
      </TopBar>

      <Content>
        {/* 프로필 — 아이돌 변경 필요 시 ProfileCard.jsx 수정 */}
        <ProfileCard
          idol={selectedIdol}
          onChangeClick={() => setShowIdolModal(true)}
        />

        {/* 즐겨찾기 — 기능 추가 시 FavoritesSection.jsx 수정 */}
        <FavoritesSection onMapClick={() => navigate('/home')} />

        {/* 내 코스 — 기능 추가 시 MyCoursesSection.jsx 수정 */}
        <MyCoursesSection
          onCourseClick={() => navigate('/course')}
          onCreateClick={() => navigate('/course')}
        />

        {/* 방문기록 / 피드 링크 — 항목 추가 시 QuickNavSection.jsx의 ITEMS 배열에 추가 */}
        <QuickNavSection onNavigate={(key) => navigate(`/${key}`)} />
      </Content>

      <IdolSelectModal
        isOpen={showIdolModal}
        idols={idols}
        onSelect={(idol) => { onIdolChange(idol); setShowIdolModal(false) }}
      />
    </Page>
  )
}
