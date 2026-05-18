import styled from 'styled-components'

const Card = styled.article`
  background: #fffade;
  border: 1px solid rgba(232,214,100,0.25);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(232,214,100,0.2);
  }
`

const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #d9d9d9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Body = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const PlaceName = styled.span`
  font-size: 12px;
  color: #e4ab4f;
  font-weight: 600;
`

const Content = styled.p`
  font-size: 13px;
  color: rgba(45,47,54,0.8);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(45,47,54,0.4);
`

/**
 * 팬 피드 카드 컴포넌트
 * @param {{ image: string, placeName: string, content: string, viewCount: number, createdAt: string }} props
 */
export default function FeedCard({ image, placeName, content, viewCount, createdAt }) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR')
  return (
    <Card>
      <Thumbnail>
        {image && <img src={image} alt={placeName} />}
      </Thumbnail>
      <Body>
        <PlaceName>{placeName}</PlaceName>
        <Content>{content}</Content>
        <Meta>
          <span>{date}</span>
          <span>👁 {viewCount}</span>
        </Meta>
      </Body>
    </Card>
  )
}
