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
  myLocation,
  routeCoords, // 🌟 [교정] 부모(Home)가 낚아챈 우돈청 데이터를 접수합니다.
}) {
  switch (navId) {
    case "route":
      return (
        <RoutePanel
          onRouteSearch={onRouteSearch}
          mapCenter={mapCenter}
          myLocation={myLocation}
          routeCoords={routeCoords} // 🌟 [교정] 길찾기 패널에게 우돈청 데이터를 최종 배달합니다.
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
