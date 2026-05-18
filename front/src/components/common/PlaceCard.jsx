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
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  justify-content: space-between;
`

const Name = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #e8b664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MoreBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(45, 47, 54, 0.35);
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;

  &:hover { color: #e8b664; }
`

const Inner = ({ image, name, description, onClick, actions }) => (
  <>
    <CardImage>
      {image && <img src={image} alt={name} loading="lazy" />}
    </CardImage>
    <CardBody>
      <Description>{description}</Description>
      <Footer>
        <Name title={name}>{name}</Name>
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
