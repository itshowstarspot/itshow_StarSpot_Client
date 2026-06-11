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
  mapCenter,
  myLocation, // 🌟 [추가] 내 GPS 좌표 접수
}) {
  switch (navId) {
    case "route":
      // 🌟 [수정] RoutePanel로 내 실시간 GPS 데이터(myLocation) 최종 전달
      return (
        <RoutePanel
          onRouteSearch={onRouteSearch}
          mapCenter={mapCenter}
          myLocation={myLocation}
        />
      );
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
