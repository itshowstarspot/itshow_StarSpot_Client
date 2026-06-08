import { useState } from 'react'
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
  min-width: 0;
`

const Label = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.4);
  margin: 0;
`

const NicknameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const NickName = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EditBtn = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  color: rgba(45,47,54,0.3);
  font-size: 13px;
  line-height: 1;
  &:hover { color: #e8d664; }
`

const IdolName = styled.p`
  font-size: 13px;
  font-weight: 500;
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

/* 닉네임 편집 인라인 UI */
const NickInput = styled.input`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  border: none;
  border-bottom: 2px solid #e8d664;
  outline: none;
  background: transparent;
  width: 100%;
  padding: 2px 0;
`

const NickBtnRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`

const SmallBtn = styled.button`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`

const SaveBtn = styled(SmallBtn)`
  background: #e8d664;
  color: #ffffff;
  &:hover { background: #d4c250; }
`

const CancelBtn = styled(SmallBtn)`
  background: rgba(45,47,54,0.08);
  color: rgba(45,47,54,0.55);
  &:hover { background: rgba(45,47,54,0.14); }
`

export default function ProfileCard({ idol, nickname, onNicknameChange, onChangeClick }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(nickname || '')
    setEditing(true)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed) onNicknameChange(trimmed)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

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
        {editing ? (
          <>
            <Label>닉네임 변경</Label>
            <NickInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              autoFocus
            />
            <NickBtnRow>
              <SaveBtn onClick={handleSave}>저장</SaveBtn>
              <CancelBtn onClick={() => setEditing(false)}>취소</CancelBtn>
            </NickBtnRow>
          </>
        ) : (
          <>
            <Label>닉네임</Label>
            <NicknameRow>
              <NickName>{nickname || '닉네임 없음'}</NickName>
              <EditBtn onClick={startEdit} title="닉네임 변경">✏️</EditBtn>
            </NicknameRow>
            <Label style={{ marginTop: 6 }}>현재 최애 아이돌</Label>
            <IdolName>{idol?.name ?? '선택 안 됨'}</IdolName>
            {idol?.groupLabel && <Label>{idol.groupLabel}</Label>}
          </>
        )}
      </Info>

      {!editing && <ChangeBtn onClick={onChangeClick}>변경</ChangeBtn>}
    </Card>
  )
}
