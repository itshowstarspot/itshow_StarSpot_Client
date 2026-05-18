import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  color: rgba(45, 47, 54, 0.45);
  text-align: center;
`

const Icon = styled.div`
  font-size: 40px;
`

const Message = styled.p`
  font-size: 15px;
  line-height: 1.6;
`

/**
 * 빈 상태 안내 컴포넌트
 * @param {{ icon?: string, message: string }} props
 */
export default function EmptyState({ icon = '🔍', message }) {
  return (
    <Wrapper>
      <Icon>{icon}</Icon>
      <Message>{message}</Message>
    </Wrapper>
  )
}
