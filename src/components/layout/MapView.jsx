import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { loadKakaoMapSdk } from "../../services/kakaoMap";

const MapWrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ErrorMsg = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(45, 47, 54, 0.5);
  font-size: 14px;
  gap: 8px;
  background: #f5f5f8;
  z-index: 20;
`;

const MyLocationBtn = styled.button`
  position: absolute;
  bottom: 24px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
  &:hover {
    background: #f5f5f8;
  }
  &:active {
    transform: scale(0.93);
  }
  svg {
    width: 22px;
    height: 22px;
  }
`;

const CATEGORY_COLOR = {
  카페: { bg: "#e8d664", border: "#b8962a", text: "#7a6210" },
  음식점: { bg: "#ff8c66", border: "#c45c36", text: "#fff" },
  관광지: { bg: "#66b8ff", border: "#3680c4", text: "#fff" },
  기타: { bg: "#b08cff", border: "#7050c0", text: "#fff" },
};

function getColor(category) {
  return CATEGORY_COLOR[category] ?? CATEGORY_COLOR["기타"];
}

function createPinEl(place, onClick) {
  const { bg, border, text } = getColor(place.category);
  const wrap = document.createElement("div");
  wrap.style.cssText = `position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;`;

  const label = document.createElement("div");
  label.textContent = place.name;
  label.style.cssText = `max-width: 100px; padding: 4px 8px; border-radius: 999px; background: ${bg}; border: 1.5px solid ${border}; color: ${text}; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 2px 8px rgba(0,0,0,0.18); margin-bottom: 2px;`;

  const tail = document.createElement("div");
  tail.style.cssText = `width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid ${border};`;

  wrap.appendChild(label);
  wrap.appendChild(tail);
  wrap.addEventListener("click", () => onClick(place));
  return wrap;
}

function createMyLocationEl() {
  const wrap = document.createElement("div");
  wrap.style.cssText = `position: relative; display: flex; align-items: center; justify-content: center;`;
  const outer = document.createElement("div");
  outer.style.cssText = `width: 20px; height: 20px; border-radius: 50%; background: rgba(66, 133, 244, 0.2); display: flex; align-items: center; justify-content: center;`;
  const inner = document.createElement("div");
  inner.style.cssText = `width: 12px; height: 12px; border-radius: 50%; background: #4285F4; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(66,133,244,0.5);`;
  outer.appendChild(inner);
  wrap.appendChild(outer);
  return wrap;
}

const FALLBACK_LOCATION = { lat: 37.4664, lng: 126.9324 };

export default function MapView({
  places = [],
  onPlaceClick,
  routeCoords,
  onMapCenterChange,
  onMyLocationChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const myLocationRef = useRef(null);
  const infoOverlayRef = useRef(null);
  const currentPosRef = useRef(null);

  const routeElementsRef = useRef({
    startMarker: null,
    endMarker: null,
    polyline: null,
  });

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);

  const onMapCenterChangeRef = useRef(onMapCenterChange);
  const onMyLocationChangeRef = useRef(onMyLocationChange);

  useEffect(() => {
    onMapCenterChangeRef.current = onMapCenterChange;
    onMyLocationChangeRef.current = onMyLocationChange;
  }, [onMapCenterChange, onMyLocationChange]);

  /* 지도 초기화 및 위치 추적 */
  useEffect(() => {
    // 데스크탑 환경이므로 실시간 watchId는 필요 없음
    loadKakaoMapSdk()
      .then(() => {
        if (!containerRef.current || mapRef.current) return;

        // 1. 처음 지도가 켜질 때부터 무조건 학교 중심(FALLBACK_LOCATION)으로 시작!
        const fallbackPos = new window.kakao.maps.LatLng(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
        
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: fallbackPos,
          level: 4, // 숫자가 작을수록 확대 (학교가 잘 보이게 4 정도로 조정)
        });
        mapRef.current = map;
        setIsReady(true);

        // 지도 움직일 때 부모에게 센터 알리는 이벤트
        window.kakao.maps.event.addListener(map, "idle", () => {
          const center = map.getCenter();
          if (onMapCenterChangeRef.current) {
            onMapCenterChangeRef.current({
              lat: center.getLat(),
              lng: center.getLng(),
            });
          }
        });

        // 2. 💡 [핵심] GPS를 호출하지 않고, 켜지자마자 학교 위치에 파란색 내 위치 마커를 강제로 꼽습니다.
        currentPosRef.current = fallbackPos;

        if (onMyLocationChangeRef.current) {
          onMyLocationChangeRef.current({ lat: FALLBACK_LOCATION.lat, lng: FALLBACK_LOCATION.lng });
        }

        const el = createMyLocationEl();
        const overlay = new window.kakao.maps.CustomOverlay({
          position: fallbackPos,
          content: el,
          yAnchor: 0.5,
          xAnchor: 0.5,
        });
        overlay.setMap(map);
        myLocationRef.current = overlay;

      })
      .catch((err) => setError(err.message));

    // 감시하던 watchId가 없으므로 클린업 함수는 비워둡니다.
    return () => {};
  }, []);

  /* 장소 핀 마커 */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const kakao = window.kakao.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    infoOverlayRef.current?.setMap(null);
    infoOverlayRef.current = null;

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      const position = new kakao.LatLng(place.lat, place.lng);

      const handlePinClick = (clickedPlace) => {
        infoOverlayRef.current?.setMap(null);
        const infoEl = document.createElement("div");
        infoEl.style.cssText = `background: #fff; border: 1.5px solid #e8d664; border-radius: 10px; padding: 10px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 4px; min-width: 140px; position: relative; cursor: pointer;`;

        const nameEl = document.createElement("div");
        nameEl.textContent = clickedPlace.name;
        nameEl.style.cssText = `font-size: 13px; font-weight: 700; color: #2d2f36;`;

        const addrEl = document.createElement("div");
        addrEl.textContent = clickedPlace.address || "";
        addrEl.style.cssText = `font-size: 11px; color: rgba(45,47,54,0.5);`;

        const closeEl = document.createElement("button");
        closeEl.textContent = "✕";
        closeEl.style.cssText = `position: absolute; top: 6px; right: 8px; background: none; border: none; font-size: 12px; color: rgba(45,47,54,0.4); cursor: pointer; padding: 0;`;
        closeEl.addEventListener("click", (e) => {
          e.stopPropagation();
          infoOverlayRef.current?.setMap(null);
          infoOverlayRef.current = null;
        });

        infoEl.appendChild(nameEl);
        if (clickedPlace.address) infoEl.appendChild(addrEl);
        infoEl.appendChild(closeEl);
        
        infoEl.addEventListener("click", () => {
          if (!clickedPlace) return;

          if (onPlaceClick) {
            onPlaceClick(clickedPlace); 
          } else {
            console.warn("부모 컴포넌트에서 장소 클릭 함수(onPlaceClick)를 전달받지 못했습니다.");
          }
        });

        const infoOverlay = new kakao.CustomOverlay({
          position,
          content: infoEl,
          yAnchor: 1.6,
        });
        infoOverlay.setMap(map);
        infoOverlayRef.current = infoOverlay;
        map.panTo(position);
      };

      const pinEl = createPinEl(place, handlePinClick);
      const overlay = new kakao.CustomOverlay({
        position,
        content: pinEl,
        yAnchor: 1.0,
      });
      overlay.setMap(map);
      markersRef.current.push(overlay);
    });

    if (
      !routeCoords &&
      places.length > 0 &&
      places.some((p) => p.lat && p.lng)
    ) {
      const bounds = new kakao.LatLngBounds();
      places.forEach((p) => {
        if (p.lat && p.lng) bounds.extend(new kakao.LatLng(p.lat, p.lng));
      });
      // map.setBounds(bounds);
    }
  }, [isReady, places, onPlaceClick, routeCoords]);

  /* 실시간 경로선 렌더링 훅 */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const kakao = window.kakao.maps;

    if (routeElementsRef.current.startMarker)
      routeElementsRef.current.startMarker.setMap(null);
    if (routeElementsRef.current.endMarker)
      routeElementsRef.current.endMarker.setMap(null);
    if (routeElementsRef.current.polyline)
      routeElementsRef.current.polyline.setMap(null);

    routeElementsRef.current = {
      startMarker: null,
      endMarker: null,
      polyline: null,
    };
    if (!routeCoords || !routeCoords.start || !routeCoords.end) return;

    const bounds = new kakao.LatLngBounds();
    const startPos = new kakao.LatLng(
      routeCoords.start.lat,
      routeCoords.start.lng,
    );
    const startMarker = new kakao.Marker({
      position: startPos,
      map: map,
      title: "출발지",
    });
    bounds.extend(startPos);

    const endPos = new kakao.LatLng(routeCoords.end.lat, routeCoords.end.lng);
    const endMarker = new kakao.Marker({
      position: endPos,
      map: map,
      title: "목적지",
    });
    bounds.extend(endPos);

    let polylinePath = [];
    if (routeCoords.path && routeCoords.path.length > 0) {
      polylinePath = routeCoords.path.map((pt) => {
        const latLng = new kakao.LatLng(pt.lat, pt.lng);
        bounds.extend(latLng);
        return latLng;
      });
    } else {
      polylinePath = [startPos, endPos];
    }

    const polyline = new kakao.Polyline({
      path: [startPos, endPos], // 락 차단을 방지하기 위해 기본 심플 트래킹으로 강제 연동
      strokeWeight: 6,
      strokeColor: "#4285F4",
      strokeOpacity: 0.85,
      strokeStyle: "solid",
    });
    polyline.setMap(map);

    routeElementsRef.current = { startMarker, endMarker, polyline };
    map.setBounds(bounds);
  }, [isReady, routeCoords]);

  const handleGoToMyLocation = () => {
    if (!mapRef.current) return;
    
    if (currentPosRef.current) {
      mapRef.current.setCenter(currentPosRef.current);
      mapRef.current.setLevel(3);
      return;
    }
    
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = new window.kakao.maps.LatLng(
          coords.latitude,
          coords.longitude,
        );
        currentPosRef.current = pos;
        if (onMyLocationChangeRef.current)
          onMyLocationChangeRef.current({
            lat: coords.latitude,
            lng: coords.longitude,
          });
        mapRef.current.setCenter(pos);
        mapRef.current.setLevel(3);
        setLocating(false);
      },
      (err) => {
        console.log("[MapView] 내 위치 이동 실패: 기본 위치로 대치합니다.", err.message);
        const fallbackPos = new window.kakao.maps.LatLng(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
        mapRef.current.setCenter(fallbackPos);
        mapRef.current.setLevel(3);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <MapWrap>
      <MapContainer ref={containerRef} />
      {error && (
        <ErrorMsg>
          <span>🗺</span>
          <span>{error}</span>
        </ErrorMsg>
      )}
      <MyLocationBtn
        onClick={handleGoToMyLocation}
        title="내 위치로 이동"
        style={{ opacity: locating ? 0.5 : 1 }}
      >
        {locating ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4285F4"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4285F4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" fill="#4285F4" stroke="none" />
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
          </svg>
        )}
      </MyLocationBtn>
    </MapWrap>
  );
}