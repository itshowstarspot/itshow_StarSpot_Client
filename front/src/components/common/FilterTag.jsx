import styled from 'styled-components'

const Tag = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active }) => ($active ? '#e8d664' : 'rgba(45,47,54,0.18)')};
  background: ${({ $active }) => ($active ? '#e8d664' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1a1a1a' : 'rgba(45,47,54,0.65)')};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;

  &:hover {
    border-color: #e8d664;
    color: ${({ $active }) => ($active ? '#1a1a1a' : '#b8962a')};
  }
`

/**
 * 필터 태그 버튼 컴포넌트
 * @param {{ label: string, active: boolean, onClick: () => void }} props
 */
export default function FilterTag({ label, active, onClick }) {
  return (
    <Tag $active={active} onClick={onClick}>
      {label}
    </Tag>
  )
}
