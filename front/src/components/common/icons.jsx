/**
 * 앱 공통 SVG 아이콘 컴포넌트
 * PhotoSelect, PostRegister 등 여러 파일에 중복 선언되어 있던 아이콘들을 통합합니다.
 */

export function CloseIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="m8.6 7.2 12 12 11.9-12 1.4 1.4-12 12 12 11.9-1.4 1.4-11.9-12-12 12-1.4-1.4 12-11.9-12-12 1.4-1.4Z" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M17.3 9.1 6.4 20l10.9 10.9 1.4-1.4-8.5-8.5h23.4v-2H10.2l8.5-8.5-1.4-1.4Z" />
    </svg>
  )
}

export function StarIcon({ filled, className }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <path d="m20 4.6 4.5 9.1 10.1 1.5-7.3 7.1 1.7 10-9-4.8-9 4.8 1.7-10-7.3-7.1 10.1-1.5L20 4.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
      />
    </svg>
  )
}

export function EyeIcon({ show }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
