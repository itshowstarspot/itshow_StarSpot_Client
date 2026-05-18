import { useState, useRef } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
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
`

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 20px;
  cursor: pointer;
`

const Title = styled.h1`font-size: 16px; font-weight: 700; color: #2d2f36;`

const Content = styled.div`
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 12px;
`

const FrameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`

const FrameBtn = styled.button`
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px solid ${({ $selected }) => $selected ? '#e8d664' : 'rgba(45,47,54,0.12)'};
  overflow: hidden;
  cursor: pointer;
  background: #d9d9d9;
  padding: 0;
  transition: border-color 0.18s;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const PreviewArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #d9d9d9;
  border-radius: 16px;
  overflow: hidden;
`

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const FrameOverlay = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`

const FileInput = styled.input`
  display: none;
`

const ErrorMsg = styled.p`font-size: 13px; color: #e85050;`
const SuccessMsg = styled.p`font-size: 13px; color: #64e8a0;`

/**
 * 포토 프레임 페이지
 */
export default function PhotoFrame() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [selectedFrame, setSelectedFrame] = useState(null)
  const [photoSrc, setPhotoSrc] = useState(null)
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoSrc(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!photoSrc) {
      setIsError(true)
      setMessage('저장할 사진을 먼저 선택해주세요.')
      return
    }
    // 실제 저장: canvas API 또는 서버 업로드 구현 예정
    setIsError(false)
    setMessage('사진이 저장되었어요! (실제 저장은 API 연동 후 활성화됩니다)')
  }

  const handleUpload = () => {
    if (!photoSrc) {
      setIsError(true)
      setMessage('업로드할 사진을 먼저 선택해주세요.')
      return
    }
    setIsError(false)
    setMessage('피드 업로드는 API 연동 후 활성화됩니다.')
    setTimeout(() => navigate('/feed'), 1500)
  }

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <Title>포토 프레임</Title>
      </TopBar>

      <Content>
        {/* 프레임 선택 */}
        <div>
          <SectionTitle>🖼 아이돌 프레임 선택</SectionTitle>
          <FrameGrid>
            {idols.map((idol) => (
              <FrameBtn
                key={idol.id}
                $selected={selectedFrame?.id === idol.id}
                onClick={() => setSelectedFrame(idol)}
                title={`${idol.groupLabel} ${idol.name}`}
              >
                <img src={idol.image} alt={idol.name} />
              </FrameBtn>
            ))}
          </FrameGrid>
          {!selectedFrame && (
            <p style={{ fontSize: 12, color: 'rgba(45,47,54,0.4)', marginTop: 8 }}>
              프레임 미선택 시 기본 프레임이 적용됩니다.
            </p>
          )}
        </div>

        {/* 미리보기 */}
        <div>
          <SectionTitle>📸 미리보기</SectionTitle>
          <PreviewArea>
            {photoSrc ? (
              <PreviewImage src={photoSrc} alt="선택한 사진" />
            ) : (
              <EmptyState icon="🖼️" message="사진을 선택해주세요" />
            )}
            {selectedFrame && photoSrc && (
              <FrameOverlay src={selectedFrame.image} alt="프레임" style={{ opacity: 0.3 }} />
            )}
          </PreviewArea>
        </div>

        {/* 액션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FileInput ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
          <Button fullWidth variant="secondary" onClick={() => fileRef.current?.click()}>
            📁 사진 선택
          </Button>
          <Button fullWidth onClick={handleSave}>💾 사진 저장</Button>
          <Button fullWidth variant="ghost" onClick={handleUpload}>⬆ 피드에 업로드</Button>
        </div>

        {message && (isError ? <ErrorMsg>{message}</ErrorMsg> : <SuccessMsg>{message}</SuccessMsg>)}
      </Content>
    </Page>
  )
}
