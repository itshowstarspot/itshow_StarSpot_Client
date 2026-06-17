import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import { useKakaoMap } from "../hooks/useKakaoMap";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import {
  fetchPlaceDetail,
  searchPlacesByKakao,
} from "../services/placeService";

/* ── 레이아웃 전체 구조 (네이버 지도 스타일) ── */
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

/* 상단 상자형 검색 패널 */
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

/* 네이버 지도 스타일의 상단 교통수단 대형 탭 */
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

/* 지도 및 하단 스크롤 리스트 영역 배분 */
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

/* 하단 경로 결과 카드 리스트 (네이버 지도식 UI) */
const ResultSection = styled.div`
  flex: 0.9;
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
  flex: 1;
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

/* 자동완성 드롭다운 */
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
  {
    id: 1,
    type: "WALK",
    name: "최단 도보 경로 코스",
    time: "12분",
    desc: "안전한 보행자 전용 도로 중심 안내",
  },
  {
    id: 2,
    type: "WALK",
    name: "큰길 우선 안심 코스",
    time: "15분",
    desc: "CCTV가 많고 가로등이 밝은 도로 중심 안내",
  },
  {
    id: 3,
    type: "TRANSIT",
    name: "지하철 2호선 직통선",
    time: "22분",
    desc: "신림역 승차 ➡️ 신대방역 하차 (도보 최소화)",
  },
  {
    id: 4,
    type: "DRIVE",
    name: "남부순환로 추천 경로",
    time: "8분",
    desc: "실시간 교통 상태를 반영한 원활한 통행 경로",
  },
];

/* ── 메인 컴포넌트 ── */
// 🌟 부모(Home)에서 전달받을 props 명시 (myLocation, routeCoords 추가)
export default function Route({ myLocation, routeCoords }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");

  // useCurrentLocation 훅은 백그라운드 캐시가 늦을 수 있으므로 부모의 myLocation 우선 활용
  const { location: gpsLocation, isLocating } = useCurrentLocation();
  const {
    containerRef: mapRef,
    error,
    map: mapInstance,
  } = useKakaoMap({ center: myLocation || gpsLocation, level: 4 });

  const [transportMode, setTransportMode] = useState("WALK");
  const [originText, setOriginText] = useState("");
  const [originCoord, setOriginCoord] = useState(null);
  const [destText, setDestText] = useState("");
  const [destCoord, setDestCoord] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [fetchedAddress, setFetchedAddress] = useState("");

  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // 좌표 데이터 기반 주소 텍스트 치환 핸들러
  const updateAddressFromCoords = useCallback((coords) => {
    if (!coords) return;
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          const fullAddrText = `📍 ${addr}`;
          setOriginText(fullAddrText);
          setFetchedAddress(fullAddrText);
          setOriginCoord(coords);
        } else {
          setOriginText("📍 현재 위치 (GPS 확보됨)");
          setOriginCoord(coords);
        }
      });
    } else {
      setOriginText("📍 현재 위치");
      setOriginCoord(coords);
    }
  }, []);

  // 🌟 [자동완성 교정 1] 부모(MapView)에서 수신받은 실시간 위치 정보가 갱신되면 출발지를 자동 바인딩
  useEffect(() => {
    const activeLocation = myLocation || gpsLocation;
    if (activeLocation) {
      updateAddressFromCoords(activeLocation);
    } else if (isLocating) {
      setOriginText("실시간 내 GPS 수신 중...");
    }
  }, [myLocation, gpsLocation, isLocating, updateAddressFromCoords]);

  // 🌟 [자동완성 교정 2] 우돈청 등 [길찾기] 버튼 클릭으로 연동된 directTrigger 신호 즉시 반영
  useEffect(() => {
    if (routeCoords && routeCoords.isDirectTrigger) {
      setDestText(routeCoords.name);
      setDestCoord({ lat: routeCoords.lat, lng: routeCoords.lng });
    } else if (placeId) {
      // 쿼리 스트링 기반 기존 처리
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
        .catch((err) => console.error("목적지 파싱 오류", err));
    }
  }, [placeId, routeCoords]);

  // 🌟 [자동완성 교정 3] 출발지와 목적지가 모두 완비되는 순간 광화문을 탈출하여 초점 맞추고 자동으로 가상 선 그리기
  useEffect(() => {
    if (originCoord && destCoord && mapInstance && window.kakao) {
      const maps = window.kakao.maps;
      const startPos = new maps.LatLng(originCoord.lat, originCoord.lng);
      const endPos = new maps.LatLng(destCoord.lat, destCoord.lng);

      const bounds = new maps.LatLngBounds();
      bounds.extend(startPos);
      bounds.extend(endPos);
      mapInstance.setBounds(bounds);

      // 사용자가 루트 카드를 누르기 전에도 최초 1회 화면에 기본 점라인 매칭 트리거
      if (!activeRouteId && filteredRoutes.length > 0) {
        handleDrawRouteOnMap(filteredRoutes[0]);
      }
    }
  }, [originCoord, destCoord, mapInstance, activeRouteId]);

  // 경로 그리기 로직
  const handleDrawRouteOnMap = useCallback(
    (routeItem) => {
      if (!originCoord || !destCoord) return;
      setActiveRouteId(routeItem.id);

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) polylineRef.current.setMap(null);

      if (!mapInstance || !window.kakao || !window.kakao.maps) return;

      const maps = window.kakao.maps;
      const startPos = new maps.LatLng(originCoord.lat, originCoord.lng);
      const endPos = new maps.LatLng(destCoord.lat, destCoord.lng);

      const startMarker = new maps.Marker({
        position: startPos,
        map: mapInstance,
      });
      const endMarker = new maps.Marker({ position: endPos, map: mapInstance });
      markersRef.current = [startMarker, endMarker];

      const strokeColors = {
        WALK: "#4285F4",
        TRANSIT: "#2DB400",
        DRIVE: "#F06B13",
      };

      const polyline = new maps.Polyline({
        path: [startPos, endPos],
        strokeWeight: 6,
        strokeColor: strokeColors[transportMode] || "#4285F4",
        strokeOpacity: 0.85,
      });
      polyline.setMap(mapInstance);
      polylineRef.current = polyline;
    },
    [originCoord, destCoord, mapInstance, transportMode],
  );

  const handleTabChange = (mode) => {
    setTransportMode(mode);
    setActiveRouteId(null);
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  };

  const filteredRoutes = DUMMY_ROUTES_DATA.filter(
    (r) => r.type === transportMode,
  );

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
              if (v !== fetchedAddress) setOriginCoord(null);
            }}
            onSelect={({ name, lat, lng }) => {
              setOriginText(name);
              setOriginCoord({ lat, lng });
            }}
            placeholder="출발지를 검색하세요"
          />
          {originText !== fetchedAddress && (
            <MyLocBtn
              type="button"
              onClick={() => {
                const activeLoc = myLocation || gpsLocation;
                if (activeLoc) updateAddressFromCoords(activeLoc);
              }}
            >
              📍 현위치
            </MyLocBtn>
          )}
        </RouteRow>

        <RouteRow>
          <DotCol>
            <Dot $color="#e8d664" />
          </DotCol>
          <AutoInput
            value={destText}
            onChange={(v) => {
              setDestText(v);
              setDestCoord(null);
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
        <TabButton
          $isActive={transportMode === "WALK"}
          onClick={() => handleTabChange("WALK")}
        >
          🏃 도보
        </TabButton>
        <TabButton
          $isActive={transportMode === "TRANSIT"}
          onClick={() => handleTabChange("TRANSIT")}
        >
          🚌 대중교통
        </TabButton>
        <TabButton
          $isActive={transportMode === "DRIVE"}
          onClick={() => handleTabChange("DRIVE")}
        >
          🚗 자동차
        </TabButton>
      </TransportTabRow>

      <MainContent>
        <MapArea>
          {error ? (
            <EmptyState icon="🗺️" message={error} />
          ) : (
            <MapContainer ref={mapRef} />
          )}
        </MapArea>

        <ResultSection>
          <SectionLabelRow>추천 이동 경로 안내</SectionLabelRow>
          <CardList>
            {filteredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                onClick={() => handleDrawRouteOnMap(route)}
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
