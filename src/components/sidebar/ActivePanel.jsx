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
  routeCoords,
  courseRoute,
  onCourseRouteClear,
}) {
  switch (navId) {
    case "route":
      return (
        <RoutePanel
          onRouteSearch={onRouteSearch}
          mapCenter={mapCenter}
          myLocation={myLocation}
          routeCoords={routeCoords}
          courseRoute={courseRoute}
          onCourseRouteClear={onCourseRouteClear}
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
