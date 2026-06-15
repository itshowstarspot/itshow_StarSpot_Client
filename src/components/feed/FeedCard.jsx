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
  position: relative;

  img, video {
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
  margin: 0;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(45,47,54,0.4);
`

const Actions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`

const ActionBtn = styled.button`
  flex: 1;
  padding: 5px 0;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.75; }
`

const EditBtn = styled(ActionBtn)`
  border-color: rgba(232,214,100,0.5);
  background: rgba(232,214,100,0.1);
  color: #b8a030;
`

const DeleteBtn = styled(ActionBtn)`
  border-color: rgba(232,80,80,0.3);
  background: rgba(232,80,80,0.07);
  color: #c04040;
`

const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.startsWith('blob:')
}

export default function FeedCard({ image, placeName, content, viewCount, createdAt, onEdit, onDelete }) {
  const parsedDate = new Date(createdAt)
  const date = isNaN(parsedDate.getTime())
    ? ''
    : parsedDate.toLocaleDateString('ko-KR')

  const isVideo = isVideoUrl(image)

  return (
    <Card>
      <Thumbnail>
        {image && (
          isVideo
            ? <video src={image} muted playsInline />
            : <img
                src={image}
                alt={placeName ? `${placeName} 방문 사진` : '방문 사진'}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
        )}
      </Thumbnail>
      <Body>
        <PlaceName>{placeName}</PlaceName>
        <Content>{content}</Content>
        <Meta>
          <span>{date}</span>
          {viewCount != null && <span>👁 {viewCount}</span>}
        </Meta>
        {(onEdit || onDelete) && (
          <Actions>
            {onEdit && <EditBtn onClick={onEdit}>수정</EditBtn>}
            {onDelete && <DeleteBtn onClick={onDelete}>삭제</DeleteBtn>}
          </Actions>
        )}
      </Body>
    </Card>
  )
}
