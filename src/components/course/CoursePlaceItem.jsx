import styled from 'styled-components'

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f5f5f8;
  border: 1px solid rgba(45,47,54,0.1);
  border-radius: 10px;
  cursor: grab;
  transition: background 0.18s;

  &:active { cursor: grabbing; background: rgba(232,214,100,0.08); }
`

const Order = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const PlaceName = styled.span`
  flex: 1;
  font-size: 14px;
  color: #2d2f36;
`

const RemoveBtn = styled.button`
  border: none;
  background: transparent;
  color: rgba(45,47,54,0.3);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.18s;

  &:hover { color: #e85050; }
`

const DragHandle = styled.span`
  color: rgba(45,47,54,0.2);
  font-size: 14px;
  cursor: grab;
`

/**
 * 코스 내 장소 아이템 (드래그 가능)
 * @param {{ index: number, place: Place, onRemove: () => void }} props
 */
export default function CoursePlaceItem({ index, place, onRemove }) {
  return (
    <Item draggable>
      <DragHandle>⠿</DragHandle>
      <Order>{index + 1}</Order>
      <PlaceName>{place.name}</PlaceName>
      <RemoveBtn type="button" onClick={onRemove} title="제거">✕</RemoveBtn>
    </Item>
  )
}
