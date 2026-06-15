import styled from 'styled-components'

/* ── 폴더 탭 카드 래퍼 ── */
const FolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.07));
  transition: filter 0.2s;

  &:hover { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.14)); }
`

/* 탭 (폴더 상단에 튀어나온 부분) */
const FolderTab = styled.div`
  align-self: flex-start;
  background: rgba(232, 214, 100, 0.45);
  border: 1.5px solid #e8d664;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 4px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #7a6a10;
`

/* 폴더 본체 */
const FolderBody = styled.div`
  border: 1.5px solid #e8d664;
  border-radius: 0 8px 8px 8px;
  overflow: hidden;
  background: #ffffff;
`

/* ── 일반 카드 ── */
const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.2s, transform 0.2s;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.13);
    transform: translateY(-2px);
  }
`

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #d9d9d9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const CardBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

/* 🎯 이름 스타일을 카드 메인 제목답게 더 크고 진하게 강조 */
const Name = styled.h4`
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a; /* 노란색 대신 가독성 좋은 진한 색상으로 변경 */
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Description = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.55);
  margin: 0;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 더보기 버튼을 우측 끝으로 밀기 */
  margin-top: 4px;
`

const MoreBtn = styled.button`
  background: transparent;
  border: none;
  color: #e8b664; /* 더보기 버튼에 포인트를 줌 */
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;

  &:hover { color: #d09f4c; }
`

// 🛠️ [순서 교정] 이름이 가장 먼저 보이고 설명이 그 아래에 깔리도록 변경했습니다!
const Inner = ({ image, name, description, onClick, actions }) => (
  <>
    <CardImage>
      {image && <img src={image} alt={name} loading="lazy" />}
    </CardImage>
    <CardBody>
      {/* 1. 장소 이름이 최상단에 듬직하게 위치합니다. */}
      <Name title={name}>{name || '성지 순례지'}</Name>
      
      {/* 2. 장소 설명 후기가 그 아래에 예쁘게 배치됩니다. */}
      <Description>{description}</Description>
      
      <Footer>
        <MoreBtn type="button" onClick={(e) => { e.stopPropagation(); onClick?.() }}>
          더보기
        </MoreBtn>
      </Footer>
      {actions}
    </CardBody>
  </>
)

export default function PlaceCard({ image, name, description, onClick, actions, badge }) {
  if (badge) {
    return (
      <FolderWrapper onClick={onClick}>
        <FolderTab>{badge}</FolderTab>
        <FolderBody>
          <Inner image={image} name={name} description={description} onClick={onClick} actions={actions} />
        </FolderBody>
      </FolderWrapper>
    )
  }

  return (
    <Card onClick={onClick}>
      <Inner image={image} name={name} description={description} onClick={onClick} actions={actions} />
    </Card>
  )
}