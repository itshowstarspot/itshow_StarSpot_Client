import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const PanelWrapper = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  height: 100%;
`;

const SearchHeader = styled.div`
  padding: 24px 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const PanelTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 700;
  color: #c09d32; /* 기존 서비스 테마에 맞춘 메인 골드 브라운 */
  display: flex;
  align-items: center;
  gap: 8px;
`;

/* ── 메인 화이트 박스 폼 컨테이너 (골드 테두리) ── */
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

/* 상단 라벨 레이어 (출발/도착 배지와 내위치 버튼 가로 정렬) */
const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NodeBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  background: #fdfae7;
  color: #c09d32;
`;

/* 아이콘 없이 텍스트만 깔끔하게 떨어지는 내 위치 버튼 */
const InlinePickButton = styled.button`
  background: #ffffff;
  border: 1.5px solid #e8d664;
  color: #c09d32;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
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
    box-shadow: 0 0 0 1px rgba(232, 214, 100, 0.2);
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

/* 🔄 두 필드 사이에 걸쳐있는 라운드 스와프 버튼 */
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
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #fdfae7;
    transform: translateY(-50%) rotate(180deg);
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
  transition: background 0.2s;
  text-align: center;
  box-shadow: 0 4px 12px rgba(232, 214, 100, 0.2);

  &:hover {
    background: #d4c255;
  }
`;

/* 자동완성 추천 리스트 디자인 */
const SuggestionList = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  max-height: 200px;
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
  gap: 2px;

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

  const centerLng = mapCenter?.lng || 126.978;
  const centerLat = mapCenter?.lat || 37.5665;

  // 장소 자동완성 기능 (Debounce 처리)
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
        console.error("자동완성 검색 실패:", err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [startQuery, endQuery, activeField, centerLng, centerLat]);

  // 카카오 로컬 역지오코딩 API: GPS 좌표 -> 주소 및 텍스트 맵핑
  const handlePickMyLocation = async (field) => {
    if (!myLocation || !myLocation.lat || !myLocation.lng) {
      alert("GPS 위치를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.");
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

      const document = addrRes.data.documents?.[0];
      let finalName = "";

      if (document) {
        const roadAddr = document.road_address;
        const regionAddr = document.address;
        if (roadAddr) {
          finalName = roadAddr.building_name
            ? `${roadAddr.address_name} (${roadAddr.building_name})`
            : roadAddr.address_name;
        } else if (regionAddr) {
          finalName = regionAddr.address_name;
        } else {
          finalName = "내 현재 위치";
        }
      } else {
        finalName = "내 현재 위치";
      }

      if (field === "start") {
        setStartQuery(finalName);
        setStartCoord({ lat: myLocation.lat, lng: myLocation.lng });
      } else {
        setEndQuery(finalName);
        setEndCoord({ lat: myLocation.lat, lng: myLocation.lng });
      }
    } catch (err) {
      console.error("내 위치 역지오코딩 오류:", err);
      alert("현재 위치의 주소 변환에 실패했습니다.");
    }
  };

  // 🔄 출발지 ⇄ 목적지 데이터 전환 핸들러
  const handleSwapNodes = () => {
    const tempQuery = startQuery;
    const tempCoord = startCoord;

    setStartQuery(endQuery);
    setStartCoord(endCoord);

    setEndQuery(tempQuery);
    setEndCoord(tempCoord);
  };

  const handleSelectPlace = (place) => {
    const coord = { lat: parseFloat(place.y), lng: parseFloat(place.x) };
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

  // 카카오 내비게이션 다이렉션 API 연동 호출
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
      const routes = res.data.routes?.[0];

      if (!routes) {
        alert("지원 가능한 경로가 존재하지 않습니다.");
        return;
      }

      routes.sections[0].roads.forEach((road) => {
        road.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push({ lng: vertex, lat: road.vertexes[index + 1] });
          }
        });
      });

      onRouteSearch({ start: startCoord, end: endCoord, path: linePath });
    } catch (err) {
      console.error("길찾기 연동 실패:", err);
      alert("경로를 탐색하는 도중 에러가 발생했습니다.");
    }
  };

  return (
    <PanelWrapper>
      <SearchHeader>
        {/* 🗺️  */}
        <PanelTitle>길찾기</PanelTitle>

        <FormContainer>
          <InputGroupWrapper>
            {/* 출발 영역 */}
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
                  }}
                  onFocus={() => setActiveField("start")}
                />
              </InputWrapper>

              {activeField === "start" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem
                      key={i}
                      onClick={() => handleSelectPlace(p)}
                    >
                      <strong style={{ color: "#111111" }}>
                        {p.place_name}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>
                        {p.address_name}
                      </span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>

            {/* 도착 영역 */}
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
                  }}
                  onFocus={() => setActiveField("end")}
                />
              </InputWrapper>

              {activeField === "end" && suggestions.length > 0 && (
                <SuggestionList>
                  {suggestions.map((p, i) => (
                    <SuggestionItem
                      key={i}
                      onClick={() => handleSelectPlace(p)}
                    >
                      <strong style={{ color: "#111111" }}>
                        {p.place_name}
                      </strong>
                      <span style={{ fontSize: "11px", color: "#888888" }}>
                        {p.address_name}
                      </span>
                    </SuggestionItem>
                  ))}
                </SuggestionList>
              )}
            </InputBlock>
          </InputGroupWrapper>

          {/* 🔄 우측 중앙에 걸쳐서 배치된 스와프(아이콘) 버튼 */}
          <SwapButton onClick={handleSwapNodes} title="출발지/목적지 전환">
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

        {/* 경로 검색하기 버튼 */}
        <SearchButton onClick={handleFindRoute}>경로 검색하기</SearchButton>
      </SearchHeader>
    </PanelWrapper>
  );
}
