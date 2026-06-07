import { Shell, NavRow, NavLabel, Arrow } from './SectionShell'

const ITEMS = [
  { icon: '📍', label: '방문 기록', key: 'visit' },
  { icon: '📰', label: '내 피드',   key: 'feed'  },
]

export default function QuickNavSection({ onNavigate }) {
  return (
    <Shell>
      {ITEMS.map(({ icon, label, key }) => (
        <NavRow key={key} onClick={() => onNavigate(key)}>
          <NavLabel>{icon} {label}</NavLabel>
          <Arrow>›</Arrow>
        </NavRow>
      ))}
    </Shell>
  )
}
