import { useState } from 'react'
import styled from 'styled-components'
import { Shell, NavRow, NavLabel } from './SectionShell'

/* ── 스타일 ──────────────────────────────────────────── */

const LogoutRow = styled(NavRow)`
  color: #2d2f36;
`

const DeleteRow = styled(NavRow)`
  border-bottom: none;
`

const DeleteLabel = styled(NavLabel)`
  color: #e85050;
`

/* 계정 탈퇴 확인 모달 오버레이 */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`

const Dialog = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px 20px;
  width: min(320px, calc(100vw - 40px));
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
`

const DialogTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #2d2f36;
  margin: 0 0 4px;
`

const DialogDesc = styled.p`
  font-size: 13px;
  color: rgba(45, 47, 54, 0.55);
  margin: 0 0 16px;
  line-height: 1.6;
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
`

const CancelBtn = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  border: 1.5px solid rgba(45, 47, 54, 0.15);
  background: #f5f5f8;
  color: #2d2f36;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: rgba(45, 47, 54, 0.08); }
`

const ConfirmBtn = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  border: none;
  background: #e85050;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #c93f3f; }
`

/* ── 컴포넌트 ─────────────────────────────────────────── */

export default function AccountSection({ onLogout, onDeleteAccount }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteConfirm = () => {
    setShowConfirm(false)
    onDeleteAccount()
  }

  return (
    <>
      <Shell>
        <LogoutRow onClick={onLogout}>
          <NavLabel>🚪 로그아웃</NavLabel>
          <span style={{ fontSize: 16, color: 'rgba(45,47,54,0.25)' }}>›</span>
        </LogoutRow>

        <DeleteRow onClick={() => setShowConfirm(true)}>
          <DeleteLabel>🗑️ 계정 탈퇴</DeleteLabel>
          <span style={{ fontSize: 16, color: 'rgba(232,80,80,0.35)' }}>›</span>
        </DeleteRow>
      </Shell>

      {showConfirm && (
        <Overlay onClick={() => setShowConfirm(false)}>
          <Dialog onClick={(e) => e.stopPropagation()}>
            <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
            <DialogDesc>
              계정을 탈퇴하면 모든 데이터(즐겨찾기, 코스 등)가
              삭제되며 복구할 수 없어요.
            </DialogDesc>
            <BtnRow>
              <CancelBtn onClick={() => setShowConfirm(false)}>취소</CancelBtn>
              <ConfirmBtn onClick={handleDeleteConfirm}>탈퇴하기</ConfirmBtn>
            </BtnRow>
          </Dialog>
        </Overlay>
      )}
    </>
  )
}
