import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $padding }) => $padding || '32px'};
`

const Spinner = styled.div`
  width: ${({ $size }) => $size || '32px'};
  height: ${({ $size }) => $size || '32px'};
  border: 3px solid rgba(232, 214, 100, 0.2);
  border-top-color: #e8d664;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`

/**
 * 로딩 스피너 컴포넌트
 * @param {{ size?: string, padding?: string }} props
 */
export default function LoadingSpinner({ size, padding }) {
  return (
    <Wrapper $padding={padding}>
      <Spinner $size={size} />
    </Wrapper>
  )
}
