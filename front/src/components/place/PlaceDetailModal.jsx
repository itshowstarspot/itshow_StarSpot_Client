import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { fetchPlaceDetail } from '../../services/placeService'
import { useFavorites } from '../../hooks/useFavorites'
import LoadingSpinner from '../common/LoadingSpinner'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 300;
  pointer-events: none;
`

const Modal = styled.div`
  pointer-events: all;
  position: absolute;
  top: 20px;
  left: 20px;
  width: 260px;
  max-height: calc(100% - 40px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease;
`

const HeroImage = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #d9d9d9;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.42);
  border: none;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.15s;
  &:hover { background: rgba(0,0,0,0.7); }
`

const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(45,47,54,0.15); border-radius: 4px; }
`

const TopInfo = styled.div`
  padding: 12px 14px 0;
`

const SubDesc = styled.p`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.5);
  margin: 0 0 4px;
  line-height: 1.4;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: #2d2f36;
    margin: 0;
  }
`

const StarBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  color: #e8d664;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.15s;
  &:hover { transform: scale(1.2); }
`

const Section = styled.div`
  padding: 14px 14px 0;
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #e8c664;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid rgba(232, 214, 100, 0.3);
`

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid rgba(232, 214, 100, 0.45);
  margin-bottom: 14px;
`

const InfoRow = styled.div`
  display: flex;
  align-items: stretch;
  & + & { border-top: 1.5px solid rgba(232, 214, 100, 0.35); }
`

const InfoLabel = styled.div`
  width: 52px;
  flex-shrink: 0;
  background: rgba(232, 214, 100, 0.22);
  border-right: 1.5px solid rgba(232, 214, 100, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #7a6a10;
  padding: 8px 4px;
  text-align: center;
`

const InfoValue = styled.div`
  flex: 1;
  padding: 8px 10px;
  font-size: 11px;
  color: rgba(45, 47, 54, 0.7);
  line-height: 1.45;
  display: flex;
  align-items: center;
`

const Desc = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.65);
  line-height: 1.6;
  margin: 0 0 14px;
`

const EmptyText = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.35);
  text-align: center;
  padding: 16px 0 14px;
  margin: 0;
`

const BottomPad = styled.div`
  height: 16px;
`

export default function PlaceDetailModal({ placeId, onClose }) {
  const [place, setPlace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { favorites, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!placeId) return
    setIsLoading(true)
    fetchPlaceDetail(placeId)
      .then(setPlace)
      .finally(() => setIsLoading(false))
  }, [placeId])

  const isFavorite = favorites.includes(placeId)

  return (
    <Overlay>
      <Modal>
        <HeroImage>
          {place?.image && <img src={place.image} alt={place.name} />}
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </HeroImage>

        {isLoading ? (
          <div style={{ padding: '24px 0' }}>
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollBody>
            <TopInfo>
              <SubDesc>{place?.description || place?.address || ''}</SubDesc>
              <TitleRow>
                <h2>{place?.name ?? '식당 이름'}</h2>
                <StarBtn onClick={() => toggleFavorite(placeId)}>
                  {isFavorite ? '★' : '☆'}
                </StarBtn>
              </TitleRow>
            </TopInfo>

            {/* 홈 */}
            <Section>
              <SectionTitle>홈</SectionTitle>
              {place?.description
                ? <Desc>{place.description}</Desc>
                : <EmptyText>소개 정보가 없어요.</EmptyText>
              }
            </Section>

            {/* 메뉴 */}
            <Section>
              <SectionTitle>메뉴</SectionTitle>
              <EmptyText>메뉴 정보가 없어요.</EmptyText>
            </Section>

            {/* 리뷰 */}
            <Section>
              <SectionTitle>리뷰</SectionTitle>
              <EmptyText>리뷰가 없어요.</EmptyText>
            </Section>

            {/* 정보 */}
            <Section>
              <SectionTitle>정보</SectionTitle>
              <InfoTable>
                {place?.category && (
                  <InfoRow>
                    <InfoLabel>카테고리</InfoLabel>
                    <InfoValue>{place.category}</InfoValue>
                  </InfoRow>
                )}
                {place?.address && (
                  <InfoRow>
                    <InfoLabel>주소</InfoLabel>
                    <InfoValue>{place.address}</InfoValue>
                  </InfoRow>
                )}
                {place?.hours && (
                  <InfoRow>
                    <InfoLabel>운영시간</InfoLabel>
                    <InfoValue>{place.hours}</InfoValue>
                  </InfoRow>
                )}
                {place?.phone && (
                  <InfoRow>
                    <InfoLabel>전화</InfoLabel>
                    <InfoValue>{place.phone}</InfoValue>
                  </InfoRow>
                )}
                {!place?.category && !place?.address && !place?.hours && !place?.phone && (
                  <EmptyText>정보가 없어요.</EmptyText>
                )}
              </InfoTable>
            </Section>

            {/* 피드 */}
            <Section>
              <SectionTitle>피드</SectionTitle>
              <EmptyText>피드가 없어요.</EmptyText>
            </Section>

            <BottomPad />
          </ScrollBody>
        )}
      </Modal>
    </Overlay>
  )
}
