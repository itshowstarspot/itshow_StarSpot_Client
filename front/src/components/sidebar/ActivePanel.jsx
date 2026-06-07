/**
 * 활성 네비게이션 ID에 따라 사이드바 패널을 전환하는 컴포넌트.
 * Home, PhotoSelect, PostRegister에 동일하게 중복되어 있던 switch 로직을 통합합니다.
 */
import RoutePanel from './RoutePanel'
import FavoritesPanel from './FavoritesPanel'
import CoursePanel from './CoursePanel'
import SearchPanel from './SearchPanel'

export default function ActivePanel({ navId, selectedIdol, onPlaceClick, onCourseOpen }) {
  switch (navId) {
    case 'route':
      return <RoutePanel />
    case 'favorite':
      return <FavoritesPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
    case 'course':
      return <CoursePanel onCourseOpen={onCourseOpen} idolId={selectedIdol?.id} />
    default:
      return <SearchPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
  }
}
