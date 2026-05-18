import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(40, 40, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 800;
`

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 24px 20px;
  width: 500px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
`

/* 제목 */
const Title = styled.p`
  color: #E8C664;
  font-family: 'YPairing', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 14px;
`

const IdolHighlight = styled.strong`
  color: #E8B664;
  font-family: 'YPairing', sans-serif;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

/* 카드 그리드 감싸는 노리끼리 회색 배경 박스 */
const GridWrap = styled.div`
  border-radius: 10px 10px 0 0;
  background: rgba(230, 227, 208, 0.34);
  padding: 16px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`

/* 카드: 이미지만 */
const Card = styled.button`
  border: none;
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: #f0f0f0;
  aspect-ratio: 3 / 4;
  display: block;
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
`

export default function IdolSelectModal({ isOpen, idols, onSelect }) {
  if (!isOpen) return null

  return (
    <Overlay>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <GridWrap>
          <Title>
            따라가고 싶은 <IdolHighlight>아이돌</IdolHighlight> 선택! ⭐
          </Title>
          <Grid>
            {idols.map((idol) => (
              <Card
                key={idol.id}
                type="button"
                onClick={() => onSelect(idol)}
                title={`${idol.groupLabel} ${idol.name}`}
              >
                <img src={idol.image} alt={idol.name} />
              </Card>
            ))}
          </Grid>
        </GridWrap>
      </ModalCard>
    </Overlay>
  )
}
