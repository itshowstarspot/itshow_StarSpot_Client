import styled from 'styled-components'
import Button from '../common/Button'

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(45,47,54,0.08);
`

const HeroImage = styled.div`
  width: 100%;
  height: 220px;
  background: #d9d9d9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Body = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const Name = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #2d2f36;
`

const Category = styled.span`
  font-size: 12px;
  background: rgba(232,214,100,0.15);
  color: #b8962a;
  border-radius: 6px;
  padding: 3px 8px;
  white-space: nowrap;
  flex-shrink: 0;
`

const Address = styled.p`
  font-size: 13px;
  color: rgba(45,47,54,0.5);
  display: flex;
  align-items: center;
  gap: 4px;
`

const Description = styled.p`
  font-size: 15px;
  color: rgba(45,47,54,0.75);
  line-height: 1.6;
`

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`

/**
 * 장소 상세 카드 컴포넌트
 * @param {{ place: Place, isFavorite: boolean, onFavorite: () => void, onRoute: () => void }} props
 */
export default function PlaceDetailCard({ place, isFavorite, onFavorite, onRoute }) {
  if (!place) return null

  return (
    <Card>
      <HeroImage>
        {place.image && <img src={place.image} alt={place.name} />}
      </HeroImage>

      <Body>
        <Header>
          <Name>{place.name}</Name>
          <Category>{place.category}</Category>
        </Header>

        <Address>📍 {place.address || '주소 정보 없음'}</Address>

        {place.description && (
          <Description>{place.description}</Description>
        )}

        <Actions>
          <Button
            variant={isFavorite ? 'primary' : 'secondary'}
            size="sm"
            onClick={onFavorite}
          >
            {isFavorite ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onRoute}>
            🗺 길찾기
          </Button>
        </Actions>
      </Body>
    </Card>
  )
}
