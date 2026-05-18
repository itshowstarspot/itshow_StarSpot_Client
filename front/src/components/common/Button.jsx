import styled, { css } from 'styled-components'

const variants = {
  primary: css`
    background: #e8d664;
    color: #1a1a1a;
    &:hover:not(:disabled) { background: #d4c24e; }
  `,
  secondary: css`
    background: transparent;
    color: #e8d664;
    border: 1.5px solid #e8d664;
    &:hover:not(:disabled) { background: rgba(232,214,100,0.1); }
  `,
  ghost: css`
    background: transparent;
    color: rgba(45,47,54,0.65);
    &:hover:not(:disabled) { background: rgba(45,47,54,0.07); color: #2d2f36; }
  `,
  danger: css`
    background: #e85050;
    color: #fff;
    &:hover:not(:disabled) { background: #c94040; }
  `,
}

const sizes = {
  sm: css`padding: 6px 14px; font-size: 13px;`,
  md: css`padding: 10px 20px; font-size: 15px;`,
  lg: css`padding: 14px 28px; font-size: 17px;`,
}

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;

  ${({ $variant }) => variants[$variant] || variants.primary}
  ${({ $size }) => sizes[$size] || sizes.md}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
`

/**
 * 재사용 버튼 컴포넌트
 * @param {{ variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'lg', fullWidth?: boolean }} props
 */
export default function Button({ variant = 'primary', size = 'md', fullWidth = false, children, ...rest }) {
  return (
    <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...rest}>
      {children}
    </StyledButton>
  )
}
