/**
 * 활성 네비게이션 ID에 따라 사이드바 패널을 전환하는 컴포넌트.
 * Home, PhotoSelect, PostRegister에 동일하게 중복되어 있던 switch 로직을 통합합니다.
 */
import RoutePanel from "./RoutePanel";
import FavoritesPanel from "./FavoritesPanel";
import CoursePanel from "./CoursePanel";
import SearchPanel from "./SearchPanel";

export default function ActivePanel({
  navId,
  selectedIdol,
  onPlaceClick,
  onCourseOpen,
  onRouteSearch,
  mapCenter, // 🌟 [추가] 부모(Home.jsx)로부터 실시간 지도 중심 좌표를 받아옵니다.
}) {
  switch (navId) {
    case "route":
      // 🌟 [수정] 받아온 mapCenter를 RoutePanel로 그대로 넘겨주어 역지오코딩(지도중심 기능)이 동작하게 합니다.
      return <RoutePanel onRouteSearch={onRouteSearch} mapCenter={mapCenter} />;
    case "favorite":
      return (
        <FavoritesPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
      );
    case "course":
      return (
        <CoursePanel onCourseOpen={onCourseOpen} idolId={selectedIdol?.id} />
      );
    default:
      return (
        <SearchPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
      );
  }
}
