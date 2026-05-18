import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { generateShareLink } from '../../services/courseService'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 400;
  pointer-events: none;
`

const Modal = styled.div`
  pointer-events: all;
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  max-height: calc(100% - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`

const ModalHeader = styled.div`
  padding: 18px 16px 12px;
  border-bottom: 1px solid rgba(45,47,54,0.07);
  flex-shrink: 0;
`

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: rgba(45,47,54,0.35);
  cursor: pointer;
  line-height: 1;
  padding: 2px;
  transition: color 0.15s;
  &:hover { color: #2d2f36; }
`

const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #e8b664;
  margin: 0 28px 4px 0;
`

const ModalDesc = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.45);
  margin: 0;
  line-height: 1.5;
`

const PlaceList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(45,47,54,0.15); border-radius: 4px; }
`

const PlaceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(45,47,54,0.09);
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  transition: border-color 0.15s;
  &:hover { border-color: rgba(232,214,100,0.5); }
`

const NumBadge = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const PlaceInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const PlaceName = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #2d2f36;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PlaceAddr = styled.div`
  font-size: 10px;
  color: rgba(45,47,54,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`

const ArrowBtns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const ArrowBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 9px;
  color: rgba(45,47,54,0.3);
  cursor: pointer;
  padding: 1px 3px;
  line-height: 1;
  &:hover { color: #e8b664; }
  &:disabled { opacity: 0.15; cursor: default; }
`

const Footer = styled.div`
  padding: 12px 14px 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(45,47,54,0.07);
`

const ShareBtn = styled.button`
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid rgba(232,214,100,0.5);
  background: rgba(232,214,100,0.12);
  color: #b8962a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(232,214,100,0.25); }
`

const DeleteBtn = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #d4c250; }
`

const CopiedMsg = styled.div`
  font-size: 11px;
  color: #4a9d8f;
  text-align: center;
`

export default function CourseDetailModal({ course, onClose, onDelete }) {
  const [places, setPlaces] = useState(course?.places ?? [])
  const [copied, setCopied] = useState(false)

  if (!course) return null

  const reorder = (from, to) => {
    setPlaces((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const handleShare = () => {
    const link = generateShareLink(course.id)
    navigator.clipboard?.writeText(link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
          <ModalTitle>{course.title || '코스 이름'}</ModalTitle>
          <ModalDesc>{places.map((p) => p.name).join(' → ')}</ModalDesc>
        </ModalHeader>

        <PlaceList>
          {places.map((place, i) => (
            <PlaceRow key={place.id ?? i}>
              <NumBadge>{i + 1}</NumBadge>
              <PlaceInfo>
                <PlaceName>{place.name}</PlaceName>
                <PlaceAddr>{place.address}</PlaceAddr>
              </PlaceInfo>
              <ArrowBtns>
                <ArrowBtn disabled={i === 0} onClick={() => reorder(i, i - 1)}>▲</ArrowBtn>
                <ArrowBtn disabled={i === places.length - 1} onClick={() => reorder(i, i + 1)}>▼</ArrowBtn>
              </ArrowBtns>
            </PlaceRow>
          ))}
        </PlaceList>

        <Footer>
          {copied && <CopiedMsg>링크가 클립보드에 복사됐어요!</CopiedMsg>}
          <ShareBtn onClick={handleShare}>🔗 코스 공유하기</ShareBtn>
          <DeleteBtn onClick={() => { onDelete(course.id); onClose() }}>삭제</DeleteBtn>
        </Footer>
      </Modal>
    </Overlay>
  )
}
