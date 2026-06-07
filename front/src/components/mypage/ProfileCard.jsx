import styled from 'styled-components'

const Card = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
`

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  background: #d9d9d9;
  border: 2.5px solid rgba(232,214,100,0.6);
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Label = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.4);
  margin: 0;
`

const Name = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0;
`

const ChangeBtn = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1.5px solid rgba(232,214,100,0.6);
  background: rgba(232,214,100,0.1);
  color: #b8962a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: rgba(232,214,100,0.25); }
`

export default function ProfileCard({ idol, onChangeClick }) {
  return (
    <Card>
      <Avatar>
        {idol?.profile
          ? <img src={idol.profile} alt={idol.name} />
          : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: '18px' }}>
              <circle cx="12" cy="8" r="4" stroke="rgba(45,47,54,0.3)" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(45,47,54,0.3)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        }
      </Avatar>
      <Info>
        <Label>현재 최애 아이돌</Label>
        <Name>{idol?.name ?? '선택 안 됨'}</Name>
        {idol?.groupLabel && <Label>{idol.groupLabel}</Label>}
      </Info>
      <ChangeBtn onClick={onChangeClick}>변경</ChangeBtn>
    </Card>
  )
}
