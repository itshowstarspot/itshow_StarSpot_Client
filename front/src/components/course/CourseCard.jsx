import styled from 'styled-components'
import Button from '../common/Button'

const Card = styled.div`
  background: #ffffff;
  border: 1px solid rgba(45,47,54,0.08);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  color: rgba(45,47,54,0.65);
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
 * @param {{ title: string, places: Place[], onShare?: () => void, onDelete?: () => void }} props
 */
export default function CourseCard({ title, places = [], onShare, onDelete }) {
  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        <PlaceCount>{places.length}개 장소</PlaceCount>
      </Header>

      <PlaceList>
        {places.slice(0, 3).map((place, idx) => (
          <PlaceItem key={place.id || idx}>{place.name}</PlaceItem>
        ))}
        {places.length > 3 && (
          <PlaceItem style={{ color: 'rgba(45,47,54,0.3)' }}>
            외 {places.length - 3}개
          </PlaceItem>
        )}
      </PlaceList>

      <Actions>
        {onShare && <Button variant="secondary" size="sm" onClick={onShare}>공유</Button>}
        {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>삭제</Button>}
      </Actions>
    </Card>
  )
}
