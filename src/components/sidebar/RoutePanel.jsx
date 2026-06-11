import React, { useState, useEffect } from "react";
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

  &:hover {
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

const MiniVehicleBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: ${({ $bg }) => $bg || "#e8d664"};
  color: #ffffff;
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

export default function RoutePanel({ onRouteSearch, mapCenter, myLocation }) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // 🌟 동적 라우팅 결과 상태값 관리 변수들
  const [hasRouteResult, setHasRouteResult] = useState(false);
  const [routeSummary, setRouteSummary] = useState({
    totalMinutes: 0,
    arrivalTimeStr: "",
    taxiFare: 0,
    distanceKm: 0,
  });

  const centerLng = mapCenter?.lng || 126.978;
  const centerLat = mapCenter?.lat || 37.5665;

  useEffect(() => {
    const query = activeField === "start" ? startQuery : endQuery;
    if (!query || query.length < 2) {
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
        setStartQuery(finalName);
        setStartCoord({ lat: myLocation.lat, lng: myLocation.lng });
      } else {
        setEndQuery(finalName);
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

  // 🌟 카카오 모빌리티 실시간 데이터 파싱 및 연동 핸들러
  const handleFindRoute = async () => {
    if (!startCoord || !endCoord) {
      alert("출발지와 목적지를 모두 지정해 주세요.");
      return;
    }
    try {
      const res = await axios.get(
        "https://apis-navi.kakaomobility.com/v1/directions",
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
          },
          params: {
            origin: `${startCoord.lng},${startCoord.lat}`,
            destination: `${endCoord.lng},${endCoord.lat}`,
            priority: "RECOMMEND",
          },
        },
      );

      const linePath = [];
      const route = res.data.routes?.[0];
      if (!route) {
        alert("탐색된 경로가 없습니다.");
        return;
      }

      // 지도 라인 드로잉용 데이터 파싱
      route.sections[0].roads.forEach((road) => {
        road.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push({ lng: vertex, lat: road.vertexes[index + 1] });
          }
        });
      });

      // 🌟 실시간 정보 변환 연산
      const durationSec = route.summary.duration; // 총 소요시간 (초 단위)
      const distanceMeter = route.summary.distance; // 총 거리 (미터 단위)
      const taxiFare = route.summary.fare.taxi; // 예상 택시 요금 (원)

      const totalMinutes = Math.ceil(durationSec / 60);
      const distanceKm = (distanceMeter / 1000).toFixed(1);

      // 도착 예정 시간 연산 (현재 시간 + 소요 분)
      const now = new Date();
      now.setMinutes(now.getMinutes() + totalMinutes);
      let hours = now.getHours();
      const ampm = hours >= 12 ? "오후" : "오전";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0시는 12시로 표시
      const minutesStr = now.getMinutes().toString().padStart(2, "0");
      const arrivalTimeStr = `${ampm} ${hours}:${minutesStr} 도착`;

      // 결과값 State 세팅
      setRouteSummary({
        totalMinutes,
        arrivalTimeStr,
        taxiFare,
        distanceKm,
      });

      onRouteSearch({ start: startCoord, end: endCoord, path: linePath });
      setHasRouteResult(true);
    } catch (err) {
      alert("경로 검색에 실패했습니다.");
    }
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
        <SearchButton onClick={handleFindRoute}>경로 검색하기</SearchButton>
      </SearchHeader>

      {/* ── 🌟 실시간 데이터가 주입되어 연동되는 결과창 섹션 ── */}
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
            {/* 출발 노드 - 실시간 반영 */}
            <TimelineItem>
              <LineGraphic $isTransit={true} $color="#e8d664" />
              <NodeIcon $color="#c09d32">출</NodeIcon>
              <NodeContent>
                <NodeTitle>{startQuery || "출발지"}</NodeTitle>
                <NodeDetail>여기서부터 차량 이동을 시작합니다.</NodeDetail>
              </NodeContent>
            </TimelineItem>

            {/* 안내 노드 */}
            <TimelineItem>
              <LineGraphic $isTransit={true} $color="#e8d664" />
              <NodeIcon $color="#e8d664">🚗</NodeIcon>
              <NodeContent>
                <NodeTitle>내비게이션 최적 경로 주행</NodeTitle>
                <NodeDetail>실시간 교통 상황 반영 완료</NodeDetail>
              </NodeContent>
            </TimelineItem>

            {/* 도착 노드 - 실시간 반영 */}
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
