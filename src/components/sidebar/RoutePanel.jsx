import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const PanelWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  h3 {
    margin: 0;
    font-size: 18px;
    color: #2d2f36;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;

const InputRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1.5px solid #e2e4ea;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #e8d664;
  }
`;

const MapPickButton = styled.button`
  padding: 10px 12px;
  background: #f1f3f7;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: #e2e4ea;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #e8d664;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(232, 214, 100, 0.2);
  margin-top: 10px;
  &:hover {
    background: #d7c453;
  }
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e4ea;
  border-radius: 8px;
  max-height: 160px;
  overflow-y: auto;
  z-index: 10;
  padding: 0;
  margin: 0;
  list-style: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const SuggestionItem = styled.li`
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

// 🌟 [수정] mapCenter가 없을 경우를 대비해 기본값(서울시청)을 안전하게 지정합니다.
export default function RoutePanel({
  onRouteSearch,
  mapCenter = { lat: 37.5665, lng: 126.978 },
}) {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startCoord, setStartCoord] = useState(null);
  const [endCoord, setEndCoord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null); // 'start' | 'end'

  // 안전하게 위경도 값을 추출하는 헬퍼 변수
  const centerLng = mapCenter?.lng || mapCenter?.longitude || 126.978;
  const centerLat = mapCenter?.lat || mapCenter?.latitude || 37.5665;

  // 주소 입력 자동완성 (카카오 로컬 API 활용)
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
            params: {
              query,
              x: centerLng,
              y: centerLat,
              radius: 20000,
            },
          },
        );
        setSuggestions(res.data.documents || []);
      } catch (err) {
        console.error("자동완성 검색 실패:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [startQuery, endQuery, activeField, centerLng, centerLat]);

  // "지도 중심" 클릭 시 해당 화면 가운데 좌표를 주소로 역변환하여 주입
  const handlePickCenter = async (field) => {
    try {
      // 🌟 옵셔널 체이닝 및 디버깅 로그 추가하여 데이터 트래킹 확보
      console.log("현재 요청 시점의 지도 중심 좌표:", {
        x: centerLng,
        y: centerLat,
      });

      const res = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
          },
          params: { x: centerLng, y: centerLat },
        },
      );

      const addrName =
        res.data.documents?.[0]?.address?.address_name || "지도 중심 지점";

      if (field === "start") {
        setStartQuery(addrName);
        setStartCoord({ lat: centerLat, lng: centerLng });
      } else {
        setEndQuery(addrName);
        setEndCoord({ lat: centerLat, lng: centerLng });
      }
    } catch (err) {
      console.error("역지오코딩 실패:", err);
      alert("현재 지도 중심의 주소를 판별할 수 없습니다.");
    }
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

  // 카카오 모빌리티 자동차 길찾기 경로 획득 함수
  const handleFindRoute = async () => {
    if (!startCoord || !endCoord) {
      alert("출발지와 목적지를 정확히 지정해 주세요.");
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
        alert("탐색된 경로가 없습니다.");
        return;
      }

      routes.sections[0].roads.forEach((road) => {
        road.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push({
              lng: vertex,
              lat: road.vertexes[index + 1],
            });
          }
        });
      });

      // 부모인 Home으로 경로 데이터 위임하여 지도에 푸른 선 표기
      onRouteSearch({
        start: startCoord,
        end: endCoord,
        path: linePath,
      });
    } catch (err) {
      console.error("길찾기 API 호출 실패:", err);
      alert(
        "경로를 탐색할 수 없습니다. (좌표 간 거리가 너무 가깝거나 도로가 없을 수 있습니다.)",
      );
    }
  };

  return (
    <PanelWrapper>
      <h3>📍 길찾기</h3>

      <InputGroup>
        <label style={{ fontSize: "12px", color: "#666" }}>출발지</label>
        <InputRow>
          <StyledInput
            placeholder="출발지 검색 또는 지도 지정"
            value={startQuery}
            onChange={(e) => {
              setStartQuery(e.target.value);
              setActiveField("start");
            }}
            onFocus={() => setActiveField("start")}
          />
          <MapPickButton onClick={() => handlePickCenter("start")}>
            지도중심
          </MapPickButton>
        </InputRow>
        {activeField === "start" && suggestions.length > 0 && (
          <SuggestionList>
            {suggestions.map((p, i) => (
              <SuggestionItem key={i} onClick={() => handleSelectPlace(p)}>
                <strong>{p.place_name}</strong>{" "}
                <span style={{ fontSize: "11px", color: "#99px" }}>
                  {p.address_name}
                </span>
              </SuggestionItem>
            ))}
          </SuggestionList>
        )}
      </InputGroup>

      <InputGroup>
        <label style={{ fontSize: "12px", color: "#666" }}>목적지</label>
        <InputRow>
          <StyledInput
            placeholder="목적지 검색 또는 지도 지정"
            value={endQuery}
            onChange={(e) => {
              setEndQuery(e.target.value);
              setActiveField("end");
            }}
            onFocus={() => setActiveField("end")}
          />
          <MapPickButton onClick={() => handlePickCenter("end")}>
            지도중심
          </MapPickButton>
        </InputRow>
        {activeField === "end" && suggestions.length > 0 && (
          <SuggestionList>
            {suggestions.map((p, i) => (
              <SuggestionItem key={i} onClick={() => handleSelectPlace(p)}>
                <strong>{p.place_name}</strong>{" "}
                <span style={{ fontSize: "11px", color: "#99px" }}>
                  {p.address_name}
                </span>
              </SuggestionItem>
            ))}
          </SuggestionList>
        )}
      </InputGroup>

      <SearchButton onClick={handleFindRoute}>경로 검색하기</SearchButton>
    </PanelWrapper>
  );
}
