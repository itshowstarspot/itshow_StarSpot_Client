import styled from 'styled-components'
import Button from '../common/Button'

const Card = styled.div`
  background: #ffffff;
  border: 1.5px solid ${({ $recommended }) => $recommended ? 'rgba(232,214,100,0.5)' : 'rgba(45,47,54,0.08)'};
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  ${({ $recommended }) => $recommended && 'background: linear-gradient(135deg, #fffef5 0%, #fff 100%);'}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`

const RecommendedBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #b8962a;
  background: rgba(232,214,100,0.2);
  border-radius: 999px;
  padding: 2px 8px;
`

const Description = styled.p`
  font-size: 12px;
  color: rgba(45,47,54,0.5);
  margin: -4px 0 0;
  line-height: 1.5;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
`

const PlaceCount = styled.span`
  font-size: 12px;
  color: rgba(45,47,54,0.4);
`

const PlaceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PlaceItem = styled.li`
  font-size: 13px;
  color: ${({ $muted }) => $muted ? 'rgba(45,47,54,0.3)' : 'rgba(45,47,54,0.65)'};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #e8d664;
    border-radius: 50%;
    flex-shrink: 0;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`

/**
 * 코스 카드 컴포넌트
 */
export default function CourseCard({ title, description, places = [], isRecommended, onShare, onDelete, onClick }) {
  return (
    <Card $recommended={isRecommended} onClick={onClick}>
      <Header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isRecommended && <RecommendedBadge>⭐ 추천 코스</RecommendedBadge>}
          <Title>{title}</Title>
        </div>
        <PlaceCount>{places.length}개 장소</PlaceCount>
      </Header>

      {description && <Description>{description}</Description>}

      <PlaceList>
        {places.slice(0, 3).map((place) => (
          <PlaceItem key={place.id}>{place.name}</PlaceItem>
        ))}
        {places.length > 3 && (
          <PlaceItem $muted>외 {places.length - 3}개</PlaceItem>
        )}
      </PlaceList>

      <Actions>
        {onShare && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation(); 
              onShare();
            }}
          >
            공유
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="danger" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation(); 
              onDelete();
            }}
          >
            삭제
          </Button>
        )}
      </Actions>
    </Card>
  )
}