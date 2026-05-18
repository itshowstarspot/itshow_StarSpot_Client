import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(60, 60, 60, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
`

/**
 * 재사용 모달 컴포넌트
 * @param {{ isOpen: boolean, onClose?: () => void, children: React.ReactNode }} props
 */
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalBox>
    </Overlay>
  )
}
