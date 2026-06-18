import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";

const PanelWrapper = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  height: 100%;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 47, 54, 0.15);
    border-radius: 4px;
  }
`;

const SearchHeader = styled.div`
  padding: 16px 18px 12px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  border-bottom: 1px solid #f1f3f5;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #c09d32;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  background: #ffffff;
  border: 2px solid #e8d664;
  border-radius: 12px;
  padding: 12px 12px;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(232, 214, 100, 0.1);
`;

const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const InputBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NodeBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #c09d32;
`;

const InlinePickButton = styled.button`
  background: #ffffff;
  border: 1.5px solid #e8d664;
  color: #c09d32;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 3px 9px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #e8d664;
    color: #ffffff;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid #dcdfe4;
  border-radius: 8px;
  padding: 4px 10px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #e8d664;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 6px 2px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  outline: none;
  background: transparent;

  &::placeholder {
    color: #a6afba;
  }
`;

const SwapButton = styled.button`
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #e8d664;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #fdfae7;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 11px;
  background: #e8d664;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(232, 214, 100, 0.2);

  &:disabled {
    background: #e2dbab;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #d4c255;
  }
`;

const ResultContainer = styled.div`
  padding: 0 18px 24px;
  display: flex;
  flex-direction: column;
`;

const SummaryBox = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #eee;
`;

const MainTimeInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #555;

  .accent-time {
    font-size: 22px;
    font-weight: 800;
    color: #c09d32;
  }
  .arrival-time {
    font-weight: 600;
    color: #222;
  }
  .fee {
    margin-left: auto;
    font-weight: 700;
    color: #333;
  }
`;

const VehicleBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SummaryBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $bg }) => $bg || "#f1f3f5"};
  color: ${({ $color }) => $color || "#333333"};
`;

const TimelineContainer = styled.div`
  margin-top: 20px;
  position: relative;
`;

const TimelineItem = styled.div`
  display: flex;
  position: relative;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }
`;

const LineGraphic = styled.div`
  position: absolute;
  left: 10px;
  top: 24px;
  bottom: 0;
  width: 3px;
  background: ${({ $isTransit, $color }) =>
    $isTransit ? $color || "#e8d664" : "transparent"};
  border-left: ${({ $isTransit }) =>
    !$isTransit ? "3px dashed #a6afba" : "none"};
  z-index: 1;

  ${TimelineItem}:last-child & {
    display: none;
  }
`;

const NodeIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid ${({ $color }) => $color || "#e8d664"};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  color: ${({ $color }) => $color || "#e8d664"};
`;

const NodeContent = styled.div`
  margin-left: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NodeTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111111;
`;

const NodeDetail = styled.div`
  font-size: 13px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0;
  margin: 0;
  list-style: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
`;

const SuggestionItem = styled.li`
  padding: 12px 14px;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f5;
  display: flex;
  flex-direction: column;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #fdfae7;
  }
`;

const WaypointBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const WaypointRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WaypointLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WaypointNum = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #4a9d8f;
`;

const RemoveWpBtn = styled.button`
  background: none;
  border: none;
  color: rgba(45, 47, 54, 0.35);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  &:hover { color: #e85050; }
`;

const WaypointScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-x: visible;
  padding-right: 2px;
`;

const AddWaypointBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 30px;
  border: 1.5px dashed rgba(74, 157, 143, 0.4);
  border-radius: 8px;
  background: transparent;
  color: #4a9d8f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: #4a9d8f;
    background: rgba(74, 157, 143, 0.05);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const TabButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 18px 8px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f1f3f5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const TabButton = styled.button`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
  border: 2px solid ${({ $active }) => ($active ? "#e8d664" : "#f1f3f5")};
  background: ${({ $active }) => ($active ? "#e8d664" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#666666")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => ($active ? "#e8d664" : "#fdfae7")};
    border-color: #e8d664;
  }
`;

const ISLANDS = [
  { lat: 33.55, lng: 126.55, dLat: 0.5, dLng: 0.6 },  // 제주도
  { lat: 37.5,  lng: 130.87, dLat: 0.15, dLng: 0.2 }, // 울릉도
  { lat: 37.24, lng: 131.87, dLat: 0.1,  dLng: 0.1 }, // 독도
];

function isIsland(coord) {
  if (!coord) return false;
  return ISLANDS.some(
    (island) =>
      Math.abs(coord.lat - island.lat) < island.dLat &&
      Math.abs(coord.lng - island.lng) < island.dLng,
  );
}

export default function RoutePanel({
  onRouteSearch,
  mapCenter,
  myLocation,
  routeCoords,
  courseRoute,
  onCourseRouteClear,
}) {
  const MIRIM = { lat: 37.4665, lng: 126.9329 };

  const [startQuery, setStartQuery] = useState("미림마이스터고등학교");
  const [endQuery, setEndQuery] = useState("");
  const [startCoord, setStartCoord] = useState(MIRIM);
  const [endCoord, setEndCoord] = useState(null);
  const [waypoints, setWaypoints] = useState([]); // [{ id, query, coord }]
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null); // 'start' | 'end' | 'wp-{id}'

  const [isLoading, setIsLoading] = useState(false);
  const [hasRouteResult, setHasRouteResult] = useState(false);
  const [activeTab, setActiveTab] = useState("transit");

  const [routeSummary, setRouteSummary] = useState({
    transit: null,
    car: null,
    walk: null,
  });

  const isIslandRoute = isIsland(startCoord) || isIsland(endCoord);
  const hideWalkTab = isIslandRoute || parseFloat(routeSummary.walk?.distanceKm ?? 0) >= 50;

  useEffect(() => {
    if (isIslandRoute && activeTab === "car") setActiveTab("transit");
    if (hideWalkTab && activeTab === "walk") setActiveTab("transit");
  }, [isIslandRoute, hideWalkTab, activeTab]);

  const lastProcessedTriggerId = useRef(null);
  const lastCourseRouteId = useRef(null);

  const centerLng = mapCenter?.lng || 126.978;
  const centerLat = mapCenter?.lat || 37.5665;

  // 코스 길찾기 이펙트
  useEffect(() => {
    if (!courseRoute?.id || courseRoute.id === lastCourseRouteId.current) return;
    const places = courseRoute.places;
    if (!places || places.length < 2) return;

    lastCourseRouteId.current = courseRoute.id;
    onCourseRouteClear?.();

    const validPlaces = places
      .filter((p) => (p.latitude || p.lat) && (p.longitude || p.lng))
      .map((p) => ({
        ...p,
        latitude: Number(p.latitude ?? p.lat),
        longitude: Number(p.longitude ?? p.lng),
      }))
      .slice(0, 6);
    if (validPlaces.length < 2) {
      alert("경로를 계산할 좌표 정보가 부족해요.");
      return;
    }

    const destination = validPlaces[validPlaces.length - 1];
    const courseWaypoints = validPlaces.slice(0, -1); // 첫 장소부터 끝 직전까지

    // 경유지 상태에 개별 장소 이름+좌표 미리 채우기
    const destName = destination.placeName || destination.place_name || destination.name || "도착지";
    setEndQuery(destName);
    setEndCoord({ lat: destination.latitude, lng: destination.longitude });
    setWaypoints(
      courseWaypoints.map((p, i) => ({
        id: Date.now() + i,
        query: p.placeName || p.place_name || p.name || `경유지 ${i + 1}`,
        coord: { lat: p.latitude, lng: p.longitude },
      }))
    );

    const doRoute = async (originLat, originLng) => {
      setIsLoading(true);
      setStartQuery("📍 내 현재 위치");
      setStartCoord({ lat: originLat, lng: originLng });

      try {
        let linePath = [];
        let totalMinutes = 0;
        let distanceKm = "0";
        let fareStr = "";

        // 카카오 우선 시도
        try {
          const params = {
            origin: `${originLng},${originLat}`,
            destination: `${destination.longitude},${destination.latitude}`,
            priority: "RECOMMEND",
          };
          if (courseWaypoints.length > 0) {
            params.waypoints = courseWaypoints.map((p) => `${p.longitude},${p.latitude}`).join("|");
          }
          const res = await axios.get("/api/kakao/directions", { params });
          const route = res.data.routes?.[0];
          if (!route) throw new Error("카카오 경로 없음");
          totalMinutes = Math.ceil(route.summary.duration / 60);
          distanceKm = (route.summary.distance / 1000).toFixed(1);
          fareStr = `택시비 약 ${(route.summary.fare?.taxi ?? 0).toLocaleString()}원`;
          route.sections.forEach((section) => {
            section.roads.forEach((road) => {
              road.vertexes.forEach((v, i) => {
                if (i % 2 === 0) linePath.push({ lng: v, lat: road.vertexes[i + 1] });
              });
            });
          });
        } catch (kakaoErr) {
          console.warn("카카오 코스 경로 실패, T-Map 폴백:", kakaoErr.message);
          const carBody = {
            startX: String(originLng), startY: String(originLat),
            endX: String(destination.longitude), endY: String(destination.latitude),
          };
          if (courseWaypoints.length > 0) {
            carBody.passList = courseWaypoints.map((p) => `${p.longitude},${p.latitude}`).join("_");
          }
          const carRes = await axios.post("/api/car/routes", carBody);
          if (!carRes.data.totalTime) { alert("경로를 찾을 수 없습니다."); return; }
          totalMinutes = Math.ceil(carRes.data.totalTime / 60);
          distanceKm = ((carRes.data.totalDistance || 0) / 1000).toFixed(1);
          fareStr = `택시비 약 ${(carRes.data.totalFare || 0).toLocaleString()}원`;
          linePath = carRes.data.linePath || [];
        }

        const walkDistKm = parseFloat(
          Math.sqrt(
            Math.pow((destination.latitude - originLat) * 111, 2) +
            Math.pow((destination.longitude - originLng) * 88, 2)
          ).toFixed(2)
        );
        const walkMins = Math.max(1, Math.round(walkDistKm * 15));

        setRouteSummary({
          transit: null,
          car: { totalMinutes, arrivalTimeStr: getArrivalTimeStr(totalMinutes), fareStr, distanceKm },
          walk: {
            totalMinutes: walkMins,
            arrivalTimeStr: getArrivalTimeStr(walkMins),
            fareStr: `약 ${Math.round(walkMins * 3.8)} kcal 소모`,
            distanceKm: walkDistKm,
          },
        });

        setActiveTab("car");
        onRouteSearch({ start: { lat: originLat, lng: originLng }, end: { lat: destination.latitude, lng: destination.longitude }, path: linePath });
        setHasRouteResult(true);
      } catch (err) {
        console.error("코스 경로 탐색 실패:", err);
        alert("경로 탐색 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    setStartQuery("미림마이스터고등학교");
    setStartCoord(MIRIM);
    doRoute(MIRIM.lat, MIRIM.lng);
  }, [courseRoute, myLocation]);

  useEffect(() => {
    if (!routeCoords?.isDirectTrigger || routeCoords.id === lastProcessedTriggerId.current) return;
    lastProcessedTriggerId.current = routeCoords.id;

    const targetEnd = { lat: routeCoords.lat, lng: routeCoords.lng };
    setEndQuery(routeCoords.name);
    setEndCoord(targetEnd);

    setStartQuery("미림마이스터고등학교");
    setStartCoord(MIRIM);
    triggerAutoFindRoute(MIRIM, targetEnd);
  }, [routeCoords, myLocation]);

  // 비동기 경로 데이터 결합 처리
  const triggerAutoFindRoute = async (start, end, extraWaypoints = []) => {
    if (isLoading) return;
    setIsLoading(true);

    const masterSummary = { transit: null, car: null, walk: null };

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentDttm = `${year}${month}${date}${hours}${minutes}`; // 예: "202606151710"

    // 1️⃣ 대중교통 탐색
    try {
      const res = await axios.post("/api/transit/routes", {
        startX: start.lng, startY: start.lat,
        endX: end.lng, endY: end.lat,
        lang: 0, count: 1, 
        searchDttm: currentDttm
      });
      const transitData = res.data;
      
      if (transitData && transitData.totalTime) {
        const totalMinutes = Number(transitData.totalTime) || 0;
        masterSummary.transit = {
          totalMinutes,
          arrivalTimeStr: getArrivalTimeStr(totalMinutes),
          fareStr: transitData.totalFare ? `${Number(transitData.totalFare).toLocaleString()}원` : "비용 미정",
          detailPath: transitData.path || [],
        };
      }
    } catch (err) { 
      console.error("대중교통 탐색 실패:", err); 
    }

    // 2️⃣ 차량 탐색 (카카오 우선, 실패 시 T-Map 폴백)
    let carLinePath = [start, end];
    try {
      const carParams = {
        origin: `${start.lng},${start.lat}`,
        destination: `${end.lng},${end.lat}`,
        priority: "RECOMMEND",
      };
      if (extraWaypoints.length > 0) {
        carParams.waypoints = extraWaypoints.map((w) => `${w.coord.lng},${w.coord.lat}`).join("|");
      }
      const res = await axios.get("/api/kakao/directions", { params: carParams });
      const route = res.data.routes?.[0];
      if (!route) throw new Error("카카오 경로 없음");
      const totalMinutes = Math.ceil(route.summary.duration / 60);
      masterSummary.car = {
        totalMinutes,
        arrivalTimeStr: getArrivalTimeStr(totalMinutes),
        fareStr: `택시비 약 ${(route.summary.fare?.taxi ?? 0).toLocaleString()}원`,
        distanceKm: (route.summary.distance / 1000).toFixed(1),
      };
      const extracted = [];
      route.sections?.forEach((section) => {
        section.roads?.forEach((road) => {
          road.vertexes?.forEach((v, i) => {
            if (i % 2 === 0) extracted.push({ lng: v, lat: road.vertexes[i + 1] });
          });
        });
      });
      if (extracted.length > 0) carLinePath = extracted;
    } catch (kakaoErr) {
      console.warn("카카오 차량 탐색 실패, T-Map으로 재시도:", kakaoErr.message);
      try {
        const carBody = {
          startX: String(start.lng), startY: String(start.lat),
          endX: String(end.lng), endY: String(end.lat),
        };
        if (extraWaypoints.length > 0) {
          carBody.passList = extraWaypoints.map((w) => `${w.coord.lng},${w.coord.lat}`).join("_");
        }
        const carRes = await axios.post("/api/car/routes", carBody);
        if (carRes.data.totalTime) {
          const totalMinutes = Math.ceil(carRes.data.totalTime / 60);
          masterSummary.car = {
            totalMinutes,
            arrivalTimeStr: getArrivalTimeStr(totalMinutes),
            fareStr: `택시비 약 ${(carRes.data.totalFare || 0).toLocaleString()}원`,
            distanceKm: ((carRes.data.totalDistance || 0) / 1000).toFixed(1),
          };
          if (carRes.data.linePath?.length > 0) carLinePath = carRes.data.linePath;
        }
      } catch (tmapErr) { console.error("T-Map 차량 탐색도 실패:", tmapErr); }
    }

    // 3️⃣ 도보 탐색 (항상 표시)
    const dLat = (end.lat - start.lat) * 111;
    const dLng = (end.lng - start.lng) * 88;
    const distanceKm = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2));
    const totalMinutes = Math.max(1, Math.round(distanceKm * 15));
    masterSummary.walk = {
      totalMinutes,
      arrivalTimeStr: getArrivalTimeStr(totalMinutes),
      fareStr: `약 ${Math.round(totalMinutes * 3.8)} kcal 소모`,
      distanceKm,
    };

    setRouteSummary(masterSummary);

    if (!masterSummary.transit && masterSummary.car) {
      setActiveTab("car");
    } else {
      setActiveTab("transit");
    }

    onRouteSearch({ start, end, path: carLinePath });
    setHasRouteResult(true);
    setIsLoading(false);
  };

  // 추천 검색어 디바운스
  useEffect(() => {
    let query = "";
    if (activeField === "start") query = startQuery;
    else if (activeField === "end") query = endQuery;
    else if (activeField?.startsWith("wp-")) {
      const id = Number(activeField.replace("wp-", ""));
      query = waypoints.find((w) => w.id === id)?.query || "";
    }
    if (!query || query.length < 2 || query.startsWith("📍") || query.startsWith("내 위치")) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/kakao/search/keyword`, {
          params: { query, x: centerLng, y: centerLat, radius: 20000 },
        });
        setSuggestions(res.data.documents || []);
      } catch (err) { console.error(err); }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [startQuery, endQuery, waypoints, activeField, centerLng, centerLat]);

  const handlePickMyLocation = (field) => {
    const setQuery = field === "start" ? setStartQuery : setEndQuery;
    const setCoord = field === "start" ? setStartCoord : setEndCoord;
    setQuery("미림마이스터고등학교");
    setCoord(MIRIM);
    setHasRouteResult(false);
  };

  // 경유지 추가
  const addWaypoint = () => {
    if (waypoints.length >= 5) { alert("경유지는 최대 5개까지 추가할 수 있어요."); return; }
    setWaypoints((prev) => [...prev, { id: Date.now(), query: "", coord: null }]);
    setHasRouteResult(false);
  };

  const removeWaypoint = (id) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
    setHasRouteResult(false);
  };

  const updateWaypointQuery = (id, value) => {
    setWaypoints((prev) => prev.map((w) => w.id === id ? { ...w, query: value, coord: null } : w));
    setActiveField(`wp-${id}`);
    setHasRouteResult(false);
  };

  const setWaypointCoord = (id, name, coord) => {
    setWaypoints((prev) => prev.map((w) => w.id === id ? { ...w, query: name, coord } : w));
  };

  const handlePickMyLocationForWaypoint = (id) => {
    setWaypointCoord(id, "미림마이스터고등학교", MIRIM);
  };

  const handleSwapNodes = () => {
    setHasRouteResult(false);
    const tQ = startQuery; const tC = startCoord;
    setStartQuery(endQuery); setStartCoord(endCoord);
    setEndQuery(tQ); setEndCoord(tC);
  };

  const handleSelectPlace = (place) => {
    const coord = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
    setHasRouteResult(false);
    if (activeField === "start") {
      setStartQuery(place.place_name); setStartCoord(coord);
    } else if (activeField === "end") {
      setEndQuery(place.place_name); setEndCoord(coord);
    } else if (activeField?.startsWith("wp-")) {
      const id = Number(activeField.replace("wp-", ""));
      setWaypointCoord(id, place.place_name, coord);
    }
    setSuggestions([]);
    setActiveField(null);
  };

  const handleFindRoute = async () => {
    if (!startCoord || !endCoord) { alert("출발지와 목적지를 모두 지정해 주세요."); return; }
    const unfilledWp = waypoints.find((w) => !w.coord);
    if (unfilledWp) { alert("경유지 좌표를 목록에서 선택해주세요."); return; }
    triggerAutoFindRoute(startCoord, endCoord, waypoints.filter((w) => w.coord));
  };

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins}분`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  };

  const getArrivalTimeStr = (mins) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    let hours = now.getHours();
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12 || 12;
    return `${ampm} ${hours}:${now.getMinutes().toString().padStart(2, "0")} 도착`;
  };

  const parseTransitStep = (stepText) => {
    const cleanText = stepText.replace(/🚶|🚍|🚇/g, "").trim();
    
    const bracketRegex = /\(([^)]+)\)/;
    const match = cleanText.match(bracketRegex);

    if (match) {
      const mainTitle = cleanText.replace(bracketRegex, "").trim();
      const subDetail = match[1].trim();
      return { mainTitle, subDetail };
    }

    return { mainTitle: cleanText, subDetail: null };
  };

  return (
    <PanelWrapper>
      <SearchHeader>
        <PanelTitle>🗺️ 길찾기</PanelTitle>
        <FormContainer>
          <InputGroupWrapper>
            <InputBlock>
              <BlockHeader>
                <NodeBadge>출발</NodeBadge>
                <InlinePickButton onClick={() => handlePickMyLocation("start")}>내위치</InlinePickButton>
              </BlockHeader>
              <InputWrapper>
                <StyledInput
                  placeholder="출발지를 입력하세요"
                  value={startQuery}
                  onChange={(e) => { setStartQuery(e.target.value); setActiveField("start"); setHasRouteResult(false); }}
                  onFocus={() => { setActiveField("start"); setHasRouteResult(false); }}
                />
              </InputWrapper>
              {activeField === "start" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem key={i} onClick={() => handleSelectPlace(p)}>
                      <strong>{p.place_name}</strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>{p.address_name}</span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>

            {/* 경유지 목록 + 추가 버튼 — 스크롤 영역 */}
            <WaypointScrollArea>
              {waypoints.map((wp, idx) => (
                <WaypointBlock key={wp.id}>
                  <WaypointLabel>
                    <WaypointNum>경유 {idx + 1}</WaypointNum>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <InlinePickButton onClick={() => handlePickMyLocationForWaypoint(wp.id)} style={{ fontSize: "11px" }}>내위치</InlinePickButton>
                      <RemoveWpBtn onClick={() => removeWaypoint(wp.id)}>✕</RemoveWpBtn>
                    </div>
                  </WaypointLabel>
                  <InputWrapper>
                    <StyledInput
                      placeholder="경유지를 입력하세요"
                      value={wp.query}
                      onChange={(e) => updateWaypointQuery(wp.id, e.target.value)}
                      onFocus={() => { setActiveField(`wp-${wp.id}`); setHasRouteResult(false); }}
                    />
                  </InputWrapper>
                  {activeField === `wp-${wp.id}` && suggestions.length > 0 && (
                    <SuggestionList>
                      {suggestions.map((p, i) => (
                        <SuggestionItem key={i} onClick={() => handleSelectPlace(p)}>
                          <strong>{p.place_name}</strong>
                          <span style={{ fontSize: "11px", color: "#888888" }}>{p.address_name}</span>
                        </SuggestionItem>
                      ))}
                    </SuggestionList>
                  )}
                </WaypointBlock>
              ))}

              <AddWaypointBtn onClick={addWaypoint} disabled={waypoints.length >= 5}>
                + 경유지 추가 {waypoints.length > 0 ? `(${waypoints.length}/5)` : ""}
              </AddWaypointBtn>
            </WaypointScrollArea>

            <InputBlock>
              <BlockHeader>
                <NodeBadge>도착</NodeBadge>
                <InlinePickButton onClick={() => handlePickMyLocation("end")}>내위치</InlinePickButton>
              </BlockHeader>
              <InputWrapper>
                <StyledInput
                  placeholder="도착지를 입력하세요"
                  value={endQuery}
                  onChange={(e) => { setEndQuery(e.target.value); setActiveField("end"); setHasRouteResult(false); }}
                  onFocus={() => { setActiveField("end"); setHasRouteResult(false); }}
                />
              </InputWrapper>
              {activeField === "end" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem key={i} onClick={() => handleSelectPlace(p)}>
                      <strong>{p.place_name}</strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>{p.address_name}</span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>
          </InputGroupWrapper>

          <SwapButton onClick={handleSwapNodes}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c09d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </SwapButton>
        </FormContainer>
        <SearchButton onClick={handleFindRoute} disabled={isLoading}>
          {isLoading ? "경로 탐색 중..." : "경로 검색하기"}
        </SearchButton>
      </SearchHeader>

      {hasRouteResult && (
        <ScrollableContent>
          <TabButtonGroup>
            <TabButton $active={activeTab === "transit"} onClick={() => setActiveTab("transit")}>대중교통</TabButton>
            {!isIslandRoute && (
              <TabButton $active={activeTab === "car"} onClick={() => setActiveTab("car")}>자동차</TabButton>
            )}
            {!hideWalkTab && (
              <TabButton $active={activeTab === "walk"} onClick={() => setActiveTab("walk")}>도보</TabButton>
            )}
          </TabButtonGroup>
          <ResultContainer>
          {/* 1️⃣ 대중교통 전용 타임라인 */}
          {activeTab === "transit" && !routeSummary.transit && (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚌</div>
              <div>대중교통 경로를 찾을 수 없습니다</div>
              <div style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>자동차 또는 도보 탭을 이용해주세요</div>
            </div>
          )}
          {activeTab === "transit" && routeSummary.transit && (
            <div>
              <SummaryBox>
                <MainTimeInfo>
                  <span className="accent-time">추천 {formatDuration(routeSummary.transit.totalMinutes)}</span>
                  <span className="arrival-time">{routeSummary.transit.arrivalTimeStr}</span>
                  <span className="fee">{routeSummary.transit.fareStr} (교통비)</span>
                </MainTimeInfo>
                <VehicleBadges>
                  <SummaryBadge $bg="#e7f5ff" $color="#1c7ed6">🚍 대중교통 최적 경로</SummaryBadge>
                </VehicleBadges>
              </SummaryBox>
              <TimelineContainer>
                <TimelineItem>
                  <LineGraphic $isTransit={true} $color="#1c7ed6" />
                  <NodeIcon $color="#1c7ed6">출</NodeIcon>
                  <NodeContent><NodeTitle>{startQuery || "출발지"}</NodeTitle></NodeContent>
                </TimelineItem>
                
                {routeSummary.transit.detailPath?.map((step, index) => {
                  let icon = "•";
                  if (step.includes("🚶")) icon = "🚶";
                  if (step.includes("🚍")) icon = "🚌";
                  if (step.includes("🚇")) icon = "🚇";
                  
                  // 🌟 괄호를 자르고 데이터 분리 추출
                  const { mainTitle, subDetail } = parseTransitStep(step);

                  return (
                    <TimelineItem key={index}>
                      <LineGraphic $isTransit={true} $color={step.includes("🚶") ? "#a6afba" : "#1c7ed6"} />
                      <NodeIcon $color="#1c7ed6">{icon}</NodeIcon>
                      <NodeContent>
                        <NodeTitle>{mainTitle}</NodeTitle>
                        {subDetail && <NodeDetail>{subDetail}</NodeDetail>}
                      </NodeContent>
                    </TimelineItem>
                  );
                })}
                
                <TimelineItem>
                  <LineGraphic $isTransit={false} />
                  <NodeIcon $color="#2b8a3e">도</NodeIcon>
                  <NodeContent>
                    <NodeTitle>{endQuery || "목적지"}</NodeTitle>
                  </NodeContent>
                </TimelineItem>
              </TimelineContainer>
            </div>
          )}

          {/* 2️⃣ 자동차 전용 타임라인 */}
          {activeTab === "car" && routeSummary.car && (
            <div>
              <SummaryBox>
                <MainTimeInfo>
                  <span className="accent-time" style={{ color: '#fd7e14' }}>내비 {formatDuration(routeSummary.car.totalMinutes)}</span>
                  <span className="arrival-time">{routeSummary.car.arrivalTimeStr}</span>
                  <span className="fee">{routeSummary.car.distanceKm} km</span>
                </MainTimeInfo>
                <VehicleBadges>
                  <SummaryBadge $bg="#fff4e6" $color="#fd7e14">🚗 실시간 자동차 경로</SummaryBadge>
                </VehicleBadges>
              </SummaryBox>
              <TimelineContainer>
                <TimelineItem>
                  <LineGraphic $isTransit={true} $color="#fd7e14" />
                  <NodeIcon $color="#fd7e14">출</NodeIcon>
                  <NodeContent><NodeTitle>{startQuery || "출발지"}</NodeTitle></NodeContent>
                </TimelineItem>
                <TimelineItem>
                  <LineGraphic $isTransit={true} $color="#fd7e14" />
                  <NodeIcon $color="#ffa94d">🚗</NodeIcon>
                  <NodeContent>
                    <NodeTitle>최적 도로 실시간 주행</NodeTitle>
                    <NodeDetail>{routeSummary.car.fareStr}</NodeDetail>
                  </NodeContent>
                </TimelineItem>
                <TimelineItem>
                  <LineGraphic $isTransit={false} />
                  <NodeIcon $color="#2b8a3e">도</NodeIcon>
                  <NodeContent>
                    <NodeTitle>{endQuery || "목적지"}</NodeTitle>
                  </NodeContent>
                </TimelineItem>
              </TimelineContainer>
            </div>
          )}

          {/* 3️⃣ 도보 전용 타임라인 */}
          {activeTab === "walk" && routeSummary.walk && (
            <div>
              <SummaryBox>
                <MainTimeInfo>
                  <span className="accent-time" style={{ color: '#40c057' }}>도보 {formatDuration(routeSummary.walk.totalMinutes)}</span>
                  <span className="arrival-time">{routeSummary.walk.arrivalTimeStr}</span>
                  <span className="fee">{routeSummary.walk.distanceKm} km</span>
                </MainTimeInfo>
                <VehicleBadges>
                  <SummaryBadge $bg="#ebfbee" $color="#40c057">🚶 튼튼 보행 추천 경로</SummaryBadge>
                </VehicleBadges>
              </SummaryBox>
              <TimelineContainer>
                <TimelineItem>
                  <LineGraphic $isTransit={true} $color="#40c057" />
                  <NodeIcon $color="#40c057">출</NodeIcon>
                  <NodeContent><NodeTitle>{startQuery || "출발지"}</NodeTitle></NodeContent>
                </TimelineItem>
                <TimelineItem>
                  <LineGraphic $isTransit={true} $color="#63e6be" />
                  <NodeIcon $color="#40c057">🚶</NodeIcon>
                  <NodeContent>
                    <NodeTitle>보행자 및 골목 이면도로 우선</NodeTitle>
                    <NodeDetail>{routeSummary.walk.fareStr}</NodeDetail>
                  </NodeContent>
                </TimelineItem>
                <TimelineItem>
                  <LineGraphic $isTransit={false} />
                  <NodeIcon $color="#2b8a3e">도</NodeIcon>
                  <NodeContent>
                    <NodeTitle>{endQuery || "목적지"}</NodeTitle>
                  </NodeContent>
                </TimelineItem>
              </TimelineContainer>
            </div>
          )}
          </ResultContainer>
        </ScrollableContent>
      )}
    </PanelWrapper>
  );
}