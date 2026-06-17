import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import { useKakaoMap } from "../hooks/useKakaoMap";

import {
  fetchPlaceDetail,
  searchPlacesByKakao,
} from "../services/placeService";

const Page = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f8;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid rgba(45, 47, 54, 0.08);
  z-index: 100;
`;

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #2d2f36;
  font-size: 22px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
`;

const RoutePanelContainer = styled.div`
  background: #fff;
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const RouteRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DotCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color || "#e8d664"};
`;

const DotLine = styled.div`
  width: 1.5px;
  height: 16px;
  background: rgba(45, 47, 54, 0.15);
`;

const InputWrap = styled.div`
  position: relative;
  flex: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 38px;
  border: 1.5px solid
    ${({ $focused }) => ($focused ? "#e8d664" : "rgba(45,47,54,0.1)")};
  border-radius: 8px;
  padding: 0 32px 0 12px;
  font-size: 13.5px;
  color: #2d2f36;
  outline: none;
  background: #f5f5f8;
  box-sizing: border-box;
  &::placeholder {
    color: rgba(45, 47, 54, 0.35);
  }
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(45, 47, 54, 0.3);
  font-size: 12px;
  cursor: pointer;
`;

const MyLocBtn = styled.button`
  height: 38px;
  padding: 0 10px;
  border: 1.5px solid rgba(45, 47, 54, 0.1);
  border-radius: 8px;
  background: #fff;
  color: #4285f4;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

const TransportTabRow = styled.div`
  display: flex;
  background: #fff;
  border-bottom: 1px solid rgba(45, 47, 54, 0.08);
  padding: 0 16px;
`;

const TabButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 13.5px;
  font-weight: ${({ $isActive }) => ($isActive ? "700" : "500")};
  color: ${({ $isActive }) =>
    $isActive ? "#2d2f36" : "rgba(45, 47, 54, 0.45)"};
  position: relative;
  cursor: pointer;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 25%;
    right: 25%;
    height: 3px;
    background: #e8d664;
    transform: scaleX(${({ $isActive }) => ($isActive ? "1" : "0")});
    transition: transform 0.15s ease-in-out;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MapArea = styled.div`
  flex: 1.1;
  position: relative;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ResultSection = styled.div`
  background: #ffffff;
  border-top: 1px solid rgba(45, 47, 54, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SectionLabelRow = styled.div`
  padding: 12px 16px 6px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(45, 47, 54, 0.4);
`;

const CardList = styled.div`
  overflow-y: auto;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RouteCard = styled.div`
  border: 1.5px solid
    ${({ $isActive }) => ($isActive ? "#e8d664" : "rgba(45, 47, 54, 0.06)")};
  border-radius: 10px;
  padding: 14px;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.15s;
  &:hover {
    border-color: #e8d664;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2d2f36;
`;

const TimeBadge = styled.span`
  font-size: 12px;
  color: #e85050;
  font-weight: 700;
`;

const CardDesc = styled.div`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.5);
`;

const Dropdown = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 200;
  max-height: 160px;
  overflow-y: auto;
`;

const DropItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: rgba(232, 214, 100, 0.08);
  }
`;
const DropName = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: #2d2f36;
`;
const DropAddr = styled.div`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.4);
  margin-top: 1px;
`;

/* ── 자동완성용 서브 컴포넌트 ── */
function AutoInput({ value, onChange, onSelect, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(timerRef.current);
    if (!v.trim()) {
      setSuggestions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesByKakao(v);
        setSuggestions(
          Array.isArray(results)
            ? results.map((p) => ({
                id: p.id,
                place_name: p.name,
                road_address_name: p.address,
                address_name: p.address,
                y: p.lat,
                x: p.lng,
              }))
            : [],
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  return (
    <InputWrap>
      <StyledInput
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={placeholder}
        $focused={focused}
      />
      {value && (
        <ClearBtn
          type="button"
          onClick={() => {
            onChange("");
            setSuggestions([]);
          }}
        >
          ✕
        </ClearBtn>
      )}
      {suggestions.length > 0 && (
        <Dropdown>
          {suggestions.map((item) => (
            <DropItem
              key={item.id}
              onMouseDown={() => {
                onSelect({
                  name: item.place_name,
                  lat: parseFloat(item.y),
                  lng: parseFloat(item.x),
                });
                setSuggestions([]);
              }}
            >
              <DropName>{item.place_name}</DropName>
              <DropAddr>{item.road_address_name || item.address_name}</DropAddr>
            </DropItem>
          ))}
        </Dropdown>
      )}
    </InputWrap>
  );
}

const DUMMY_ROUTES_DATA = [
  { id: 1, type: "WALK", name: "최단 도보 경로 코스", time: "12분", desc: "안전한 보행자 전용 도로 중심 안내" },
  { id: 2, type: "WALK", name: "큰길 우선 안심 코스", time: "15분", desc: "CCTV가 많고 가로등이 밝은 도로 중심 안내" },
  { id: 3, type: "TRANSIT", name: "지하철 2호선 직통선", time: "22분", desc: "신림역 승차 ➡️ 신대방역 하차 (도보 최소화)" },
  { id: 4, type: "DRIVE", name: "남부순환로 추천 경로", time: "8분", desc: "실시간 교통 상태를 반영한 원활한 통행 경로" },
];

const FIXED_MY_LOCATION = { lat: 37.4664, lng: 126.9324 };

export default function Route({ myLocation, routeCoords }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");

  const {
    containerRef: mapRef,
    error: mapError,
    map: mapInstance,
  } = useKakaoMap({ center: FIXED_MY_LOCATION, level: 3 });

  const [transportMode, setTransportMode] = useState("WALK");
  const [originText, setOriginText] = useState("");
  const [originCoord, setOriginCoord] = useState(null);
  const [destText, setDestText] = useState("");
  const [destCoord, setDestCoord] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);

  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const clickOverlayRef = useRef(null);
  
  const schoolMarkerRef = useRef(null);
  const schoolInfoWindowRef = useRef(null);

  useEffect(() => {
    if (!mapInstance || !window.kakao) return;

    const maps = window.kakao.maps;
    const mirimPos = new maps.LatLng(FIXED_MY_LOCATION.lat, FIXED_MY_LOCATION.lng);

    const centerMarker = new maps.Marker({
      position: mirimPos,
      map: mapInstance,
    });

    const infowindow = new maps.InfoWindow({
      content: '<div style="padding:6px;font-size:12px;text-align:center;width:130px;font-weight:bold;color:#2d2f36;">미림마이스터고</div>'
    });
    infowindow.open(mapInstance, centerMarker);

    schoolMarkerRef.current = centerMarker;
    schoolInfoWindowRef.current = infowindow;

    return () => {
      centerMarker.setMap(null);
      infowindow.close();
    };
  }, [mapInstance]);
  useEffect(() => {
    if (!mapInstance || !window.kakao) return;
    const maps = window.kakao.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (originCoord && destCoord) {
      if (schoolMarkerRef.current) schoolMarkerRef.current.setMap(null);
      if (schoolInfoWindowRef.current) schoolInfoWindowRef.current.close();
    }

    const bounds = new maps.LatLngBounds();
    let pointsCount = 0;

    if (originCoord) {
      const startPos = new maps.LatLng(originCoord.lat, originCoord.lng);
      const startMarker = new maps.Marker({
        position: startPos,
        map: mapInstance,
      });
      markersRef.current.push(startMarker);
      bounds.extend(startPos);
      pointsCount++;
    }

    if (destCoord) {
      const endPos = new maps.LatLng(destCoord.lat, destCoord.lng);
      const endMarker = new maps.Marker({
        position: endPos,
        map: mapInstance,
      });
      markersRef.current.push(endMarker);
      bounds.extend(endPos);
      pointsCount++;
    }

    if (pointsCount === 2) {
      if (schoolMarkerRef.current) schoolMarkerRef.current.setMap(null);
      if (schoolInfoWindowRef.current) schoolInfoWindowRef.current.close();

      mapInstance.setBounds(bounds);

      const startPos = new maps.LatLng(originCoord.lat, originCoord.lng);
      const endPos = new maps.LatLng(destCoord.lat, destCoord.lng);
      const strokeColors = { WALK: "#4285F4", TRANSIT: "#2DB400", DRIVE: "#F06B13" };

      const polyline = new maps.Polyline({
        path: [startPos, endPos],
        strokeWeight: 6,
        strokeColor: strokeColors[transportMode] || "#4285F4",
        strokeOpacity: 0.85,
      });
      polyline.setMap(mapInstance);
      polylineRef.current = polyline;
    } else {
      if (schoolMarkerRef.current) {
        schoolMarkerRef.current.setMap(mapInstance);
        if (schoolInfoWindowRef.current) {
          schoolInfoWindowRef.current.open(mapInstance, schoolMarkerRef.current);
        }
      }

      if (pointsCount === 1) {
        const targetPos = originCoord
          ? new maps.LatLng(originCoord.lat, originCoord.lng)
          : new maps.LatLng(destCoord.lat, destCoord.lng);
        
        mapInstance.panTo(targetPos);
      }
    }
  }, [originCoord, destCoord, mapInstance, transportMode]);

  useEffect(() => {
    if (!mapInstance || !window.kakao) return;
    const maps = window.kakao.maps;

    const handleMapClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng || mapInstance.getProjection().fromPointToLatLng(mouseEvent.point);
      if (!latlng) return;

      const lat = latlng.getLat();
      const lng = latlng.getLng();

      if (clickOverlayRef.current) {
        clickOverlayRef.current.setMap(null);
      }

      const content = document.createElement("div");
      content.style.cssText = `
        background: white; padding: 10px; border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 1.5px solid #e8d664;
        display: flex; gap: 8px; font-size: 12px; font-weight: bold; z-index: 999999;
      `;

      const startBtn = document.createElement("button");
      startBtn.innerText = "🛫 출발지로";
      startBtn.style.cssText = "border:none; background:#4285F4; color:white; padding:4px 8px; border-radius:4px; cursor:pointer;";
      startBtn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        setOriginText(`📍 지도 지정 위치`);
        setOriginCoord({ lat, lng });
        if (clickOverlayRef.current) clickOverlayRef.current.setMap(null);
      };

      const endBtn = document.createElement("button");
      endBtn.innerText = "🛬 도착지로";
      endBtn.style.cssText = "border:none; background:#e85050; color:white; padding:4px 8px; border-radius:4px; cursor:pointer;";
      endBtn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDestText(`📍 지도 지정 목적지`);
        setDestCoord({ lat, lng });
        if (clickOverlayRef.current) clickOverlayRef.current.setMap(null);
      };

      content.appendChild(startBtn);
      content.appendChild(endBtn);

      const clickOverlay = new maps.CustomOverlay({
        position: latlng,
        content: content,
        yAnchor: 1.4,
        zIndex: 999999
      });

      clickOverlay.setMap(mapInstance);
      clickOverlayRef.current = clickOverlay;
    };

    maps.event.addListener(mapInstance, "click", handleMapClick);
    maps.event.addListener(mapInstance, "poi_click", handleMapClick);

    return () => {
      maps.event.removeListener(mapInstance, "click", handleMapClick);
      maps.event.removeListener(mapInstance, "poi_click", handleMapClick);
      if (clickOverlayRef.current) clickOverlayRef.current.setMap(null);
    };
  }, [mapInstance]);

  useEffect(() => {
    if (routeCoords && routeCoords.isDirectTrigger) {
      setDestText(routeCoords.name);
      setDestCoord({ lat: routeCoords.lat, lng: routeCoords.lng });
    } else if (placeId) {
      fetchPlaceDetail(placeId)
        .then((place) => {
          if (!place) return;
          const finalName = place.placeName || place.name || "목적지";
          const finalLat = place.latitude || place.lat;
          const finalLng = place.longitude || place.lng;

          setDestText(finalName);
          if (finalLat && finalLng) {
            setDestCoord({ lat: Number(finalLat), lng: Number(finalLng) });
          }
        })
        .catch((err) => console.error(err));
    }
  }, [placeId, routeCoords]);

  const handleFixedMyLocationClick = () => {
    setOriginText("📍 서울특별시 관악구 호암로 546");
    setOriginCoord(FIXED_MY_LOCATION);

    if (mapInstance && window.kakao) {
      const targetLatLng = new window.kakao.maps.LatLng(FIXED_MY_LOCATION.lat, FIXED_MY_LOCATION.lng);
      mapInstance.panTo(targetLatLng);
    }
  };

  const filteredRoutes = DUMMY_ROUTES_DATA.filter((r) => r.type === transportMode);

  return (
    <Page>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
        <Title>실시간 길찾기</Title>
      </TopBar>

      <RoutePanelContainer>
        <RouteRow>
          <DotCol>
            <Dot $color="#4285F4" />
            <DotLine />
          </DotCol>
          <AutoInput
            value={originText}
            onChange={(v) => {
              setOriginText(v);
              if (!v.trim()) setOriginCoord(null);
            }}
            onSelect={({ name, lat, lng }) => {
              setOriginText(name);
              setOriginCoord({ lat, lng });
            }}
            placeholder="출발지를 검색하거나 지도를 클릭하세요"
          />
          <MyLocBtn type="button" onClick={handleFixedMyLocationClick}>
            📍 현위치
          </MyLocBtn>
        </RouteRow>

        <RouteRow>
          <DotCol>
            <Dot $color="#e8d664" />
          </DotCol>
          <AutoInput
            value={destText}
            onChange={(v) => {
              setDestText(v);
              if (!v.trim()) setDestCoord(null);
            }}
            onSelect={({ name, lat, lng }) => {
              setDestText(name);
              setDestCoord({ lat, lng });
            }}
            placeholder="목적지를 검색하세요"
          />
        </RouteRow>
      </RoutePanelContainer>

      <TransportTabRow>
        <TabButton $isActive={transportMode === "WALK"} onClick={() => setTransportMode("WALK")}>
          🏃 도보
        </TabButton>
        <TabButton $isActive={transportMode === "TRANSIT"} onClick={() => setTransportMode("TRANSIT")}>
          🚌 대중교통
        </TabButton>
        <TabButton $isActive={transportMode === "DRIVE"} onClick={() => setTransportMode("DRIVE")}>
          🚗 자동차
        </TabButton>
      </TransportTabRow>

      <MainContent>
        <MapArea $isRouting={!!(originCoord && destCoord)}>
            {mapError ? <EmptyState icon="🗺️" message={mapError} /> : <MapContainer ref={mapRef} />}
        </MapArea>

        <ResultSection>
          <SectionLabelRow>추천 이동 경로 안내</SectionLabelRow>
          <CardList>
            {filteredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                onClick={() => setActiveRouteId(route.id)}
                $isActive={activeRouteId === route.id}
              >
                <CardHeader>
                  <CardTitle>{route.name}</CardTitle>
                  <TimeBadge>소요 시간 {route.time}</TimeBadge>
                </CardHeader>
                <CardDesc>{route.desc}</CardDesc>
              </RouteCard>
            ))}
          </CardList>
        </ResultSection>
      </MainContent>
    </Page>
  );
}