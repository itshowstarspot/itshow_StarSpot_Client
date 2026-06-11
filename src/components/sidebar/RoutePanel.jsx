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

const SearchHeader = styled.div`
  padding: 24px 20px 16px 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  border-bottom: 1px solid #f1f3f5;
  flex-shrink: 0;
`;

const PanelTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 22px;
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
  padding: 16px 14px;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(232, 214, 100, 0.1);
`;

const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 8px 2px;
  border: none;
  font-size: 15px;
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
  padding: 14px;
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
  padding: 0 20px 24px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
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

/* ── 🌟 메인 컴포넌트 교정 진입 ── */
export default function RoutePanel({
  onRouteSearch,
  mapCenter,
  myLocation,
  routeCoords,
}) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasRouteResult, setHasRouteResult] = useState(false);
  const [routeSummary, setRouteSummary] = useState({
    totalMinutes: 0,
    arrivalTimeStr: "",
    taxiFare: 0,
    distanceKm: 0,
  });

  // 무한 루프 실행 방지를 위해 이미 자동 처리 완료된 외부 신호 ID 저장용 ref
  const lastProcessedTriggerId = useRef(null);

  const centerLng = mapCenter?.lng || 126.978;
  const centerLat = mapCenter?.lat || 37.5665;

  // 📌 교정 완료된 useEffect 부분
  useEffect(() => {
    // 트리거 신호가 유효하고, 직전 처리했던 신호 ID와 다를 때만 진입
    if (
      routeCoords?.isDirectTrigger &&
      routeCoords.id !== lastProcessedTriggerId.current
    ) {
      // 내 위치 정보가 아직 도착하지 않았다면 대기 상태 표시
      if (!myLocation?.lat || !myLocation?.lng) {
        setStartQuery("📍 내 위치를 받아오는 중...");
        return;
      }

      // 조건 충족 시 중복 실행되지 않도록 즉시 ref 업데이트
      lastProcessedTriggerId.current = routeCoords.id;

      setEndQuery(routeCoords.name);
      const targetEnd = { lat: routeCoords.lat, lng: routeCoords.lng };
      setEndCoord(targetEnd);

      const targetStart = { lat: myLocation.lat, lng: myLocation.lng };
      setStartQuery("📍 내 현재 위치");
      setStartCoord(targetStart);

      // 자동 경로 탐색 API 호출
      triggerAutoFindRoute(targetStart, targetEnd);
    }
  }, [routeCoords, myLocation]);

  /* 🌟 동적 파라미터를 받아 바로 카카오 API 연동해 지도를 그리는 자동 주행 헬퍼 함수 */
  const triggerAutoFindRoute = async (start, end) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await axios.get(
        "https://apis-navi.kakaomobility.com/v1/directions",
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
          },
          params: {
            origin: `${start.lng},${start.lat}`,
            destination: `${end.lng},${end.lat}`,
            priority: "RECOMMEND",
          },
        },
      );

      const linePath = [];
      const route = res.data.routes?.[0];
      if (!route) {
        alert("경로를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      route.sections[0].roads.forEach((road) => {
        road.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push({ lng: vertex, lat: road.vertexes[index + 1] });
          }
        });
      });

      const totalMinutes = Math.ceil(route.summary.duration / 60);
      const distanceKm = (route.summary.distance / 1000).toFixed(1);

      const now = new Date();
      now.setMinutes(now.getMinutes() + totalMinutes);
      let hours = now.getHours();
      const ampm = hours >= 12 ? "오후" : "오전";
      hours = hours % 12 || 12;
      const minutesStr = now.getMinutes().toString().padStart(2, "0");

      setRouteSummary({
        totalMinutes,
        arrivalTimeStr: `${ampm} ${hours}:${minutesStr} 도착`,
        taxiFare: route.summary.fare.taxi,
        distanceKm,
      });

      // 지도가 선을 그리도록 부모 이벤트 트리거 호출
      onRouteSearch({ start, end, path: linePath });
      setHasRouteResult(true);
    } catch (err) {
      console.error("자동 경로 탐색 실패:", err);
      alert("경로 탐색 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 검색어 추천 연동 로직 (Debounce)
  useEffect(() => {
    const query = activeField === "start" ? startQuery : endQuery;
    if (
      !query ||
      query.length < 2 ||
      query.startsWith("📍") ||
      query.startsWith("내 위치")
    ) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://dapi.kakao.com/v2/local/search/keyword.json`,
          {
            headers: {
              Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
            },
            params: { query, x: centerLng, y: centerLat, radius: 20000 },
          },
        );
        setSuggestions(res.data.documents || []);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [startQuery, endQuery, activeField, centerLng, centerLat]);

  const handlePickMyLocation = async (field) => {
    if (!myLocation?.lat) {
      alert("GPS 위치 정보를 받아오는 중입니다.");
      return;
    }
    try {
      const addrRes = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
          },
          params: { x: myLocation.lng, y: myLocation.lat },
        },
      );
      const doc = addrRes.data.documents?.[0];
      const finalName =
        doc?.road_address?.address_name ||
        doc?.address?.address_name ||
        "내 현재 위치";

      setHasRouteResult(false);

      if (field === "start") {
        setStartQuery("📍 " + finalName);
        setStartCoord({ lat: myLocation.lat, lng: myLocation.lng });
      } else {
        setEndQuery("📍 " + finalName);
        setEndCoord({ lat: myLocation.lat, lng: myLocation.lng });
      }
    } catch (err) {
      alert("주소 변환에 실패했습니다.");
    }
  };

  const handleSwapNodes = () => {
    setHasRouteResult(false);
    const tQ = startQuery;
    const tC = startCoord;
    setStartQuery(endQuery);
    setStartCoord(endCoord);
    setEndQuery(tQ);
    setEndCoord(tC);
  };

  const handleSelectPlace = (place) => {
    const coord = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
    setHasRouteResult(false);

    if (activeField === "start") {
      setStartQuery(place.place_name);
      setStartCoord(coord);
    } else {
      setEndQuery(place.place_name);
      setEndCoord(coord);
    }
    setSuggestions([]);
    setActiveField(null);
  };

  const handleFindRoute = async () => {
    if (!startCoord || !endCoord) {
      alert("출발지와 목적지를 모두 지정해 주세요.");
      return;
    }
    triggerAutoFindRoute(startCoord, endCoord);
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
                <InlinePickButton onClick={() => handlePickMyLocation("start")}>
                  내위치
                </InlinePickButton>
              </BlockHeader>
              <InputWrapper>
                <StyledInput
                  placeholder="출발지를 입력하세요"
                  value={startQuery}
                  onChange={(e) => {
                    setStartQuery(e.target.value);
                    setActiveField("start");
                    setHasRouteResult(false);
                  }}
                  onFocus={() => {
                    setActiveField("start");
                    setHasRouteResult(false);
                  }}
                />
              </InputWrapper>
              {activeField === "start" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem
                      key={i}
                      onClick={() => handleSelectPlace(p)}
                    >
                      <strong>{p.place_name}</strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>
                        {p.address_name}
                      </span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>

            <InputBlock>
              <BlockHeader>
                <NodeBadge>도착</NodeBadge>
                <InlinePickButton onClick={() => handlePickMyLocation("end")}>
                  내위치
                </InlinePickButton>
              </BlockHeader>
              <InputWrapper>
                <StyledInput
                  placeholder="도착지를 입력하세요"
                  value={endQuery}
                  onChange={(e) => {
                    setEndQuery(e.target.value);
                    setActiveField("end");
                    setHasRouteResult(false);
                  }}
                  onFocus={() => {
                    setActiveField("end");
                    setHasRouteResult(false);
                  }}
                />
              </InputWrapper>
              {activeField === "end" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem
                      key={i}
                      onClick={() => handleSelectPlace(p)}
                    >
                      <strong>{p.place_name}</strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>
                        {p.address_name}
                      </span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>
          </InputGroupWrapper>

          <SwapButton onClick={handleSwapNodes}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c09d32"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <ResultContainer>
          <SummaryBox>
            <MainTimeInfo>
              <span className="accent-time">
                추천 {routeSummary.totalMinutes}분
              </span>
              <span className="arrival-time">
                {routeSummary.arrivalTimeStr}
              </span>
              <span className="fee">
                {routeSummary.taxiFare.toLocaleString()}원 (택시비)
              </span>
            </MainTimeInfo>
            <VehicleBadges>
              <SummaryBadge $bg="#fdf3df" $color="#c09d32">
                🚗 추천경로
              </SummaryBadge>
              <SummaryBadge $bg="#e8d664" $color="#ffffff">
                {routeSummary.distanceKm} km
              </SummaryBadge>
            </VehicleBadges>
          </SummaryBox>

          <TimelineContainer>
            <TimelineItem>
              <LineGraphic $isTransit={true} $color="#e8d664" />
              <NodeIcon $color="#c09d32">출</NodeIcon>
              <NodeContent>
                <NodeTitle>{startQuery || "출발지"}</NodeTitle>
                <NodeDetail>여기서부터 차량 이동을 시작합니다.</NodeDetail>
              </NodeContent>
            </TimelineItem>

            <TimelineItem>
              <LineGraphic $isTransit={true} $color="#e8d664" />
              <NodeIcon $color="#e8d664">🚗</NodeIcon>
              <NodeContent>
                <NodeTitle>내비게이션 최적 경로 주행</NodeTitle>
                <NodeDetail>실시간 교통 상황 반영 완료</NodeDetail>
              </NodeContent>
            </TimelineItem>

            <TimelineItem>
              <LineGraphic $isTransit={false} />
              <NodeIcon $color="#c09d32">도</NodeIcon>
              <NodeContent>
                <NodeTitle>{endQuery || "목적지"}</NodeTitle>
                <NodeDetail>안전하게 목적지에 도착했습니다.</NodeDetail>
              </NodeContent>
            </TimelineItem>
          </TimelineContainer>
        </ResultContainer>
      )}
    </PanelWrapper>
  );
}
