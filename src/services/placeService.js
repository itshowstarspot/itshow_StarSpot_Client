/**
 * 장소 관련 API 서비스
 * 실제 API 연동 시 BASE_URL 및 fetch 구현체 교체
 *
 * 장소 데이터 추가/수정 → src/data/places.js
 */

import { places as mockPlaces } from '../data/places'

// 백엔드 진짜 API 주소 고정
const BASE_URL = 'http://localhost:5000/api';
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;

/** 카카오 응답 → 앱 내부 Place 형식으로 변환 */
function kakaoToPlace(item, idolId = '') {
  return {
    id: String(item.id),
    name: item.place_name,
    address: item.road_address_name || item.address_name,
    image: item.image || '',
    idolId,
    category: mapCategory(item.category_group_name),
    lat: parseFloat(item.y),
    lng: parseFloat(item.x),
    description: item.category_group_name || '',
    hours: '',
    phone: item.phone || '',
    placeUrl: item.place_url || '',
  }
}

function mapCategory(kakaoCategory) {
  if (!kakaoCategory) return '기타'
  if (kakaoCategory.includes('음식') || kakaoCategory.includes('식당')) return '음식점'
  if (kakaoCategory.includes('카페')) return '카페'
  if (kakaoCategory.includes('관광') || kakaoCategory.includes('문화')) return '관광지'
  return '기타'
}

/** 카카오 키워드 장소 검색 */
async function kakaoSearchKeyword(query, { x, y, radius = 5000, size = 15 } = {}) {
  const params = new URLSearchParams({ query, size })
  if (x && y) { params.append('x', x); params.append('y', y); params.append('radius', radius) }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
  )
  if (!res.ok) throw new Error('카카오 장소 검색 실패')
  const data = await res.json()
  return data.documents ?? []
}

/**
 * 아이돌별 장소 목록 조회
 * @param {string} idolId
 * @returns {Promise<Place[]>}
 */
export const fetchPlacesByIdol = async (idolId) => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/spots`); 
    if (!res.ok) throw new Error('장소 목록 조회 실패');

    const allSpots = await res.json();

    return allSpots.map((spot) => ({
      id: String(spot.id),
      name: spot.placeName,          
      address: spot.address,
      category: spot.category || '기타',
      lat: Number(spot.latitude),    
      lng: Number(spot.longitude),   
      description: spot.description || '',
      
      // [★수정★] 상세 모달창 연동을 위해 image와 imageUrl을 모두 뚫어줍니다.
      image: spot.imageUrl || '',
      imageUrl: spot.imageUrl || '',
      
      hours: spot.operatingHours || '',
      holiday: spot.holiday || ''
    }));
  }
  return mockPlaces.filter((p) => p.idolId === idolId);
}

/**
 * 장소 검색 (카카오 키워드 검색 우선, 없으면 mock)
 */
export const searchPlaces = async (query, idolId) => {
  if (BASE_URL) {
    const params = new URLSearchParams({ query })
    if (idolId) params.append('idolId', idolId)
    const res = await fetch(`${BASE_URL}/places/search?${params}`)
    if (!res.ok) throw new Error('장소 검색 실패')
    return res.json()
  }

  if (KAKAO_REST_KEY) {
    try {
      const docs = await kakaoSearchKeyword(query)
      return docs.map((item) => kakaoToPlace(item, idolId))
    } catch { }
  }

  return mockPlaces.filter(
    (p) =>
      (p.name.includes(query) || p.description?.includes(query)) &&
      (!idolId || p.idolId === idolId)
  )
}

/**
 * 장소 상세 조회
 */
export const fetchPlaceDetail = async (placeId) => {
  if (BASE_URL) {
    try {
      // [★체크★] 중복되던 /api를 걷어내어 정상적인 백엔드 주소 라우팅 보장
      const res = await fetch(`${BASE_URL}/places/${placeId}`);
      if (!res.ok) throw new Error('장소 상세 정보 조회 실패');
      
      const spot = await res.json();
      
      return {
        id: String(spot.id),
        name: spot.placeName || spot.name,
        address: spot.address,
        category: spot.category || '기타',
        lat: Number(spot.latitude || spot.lat),
        lng: Number(spot.longitude || spot.lng),
        description: spot.description || '',
        
        // [★체크★] 모달창 상단 회색 영역을 채워줄 이미지 속성 매핑
        image: spot.imageUrl || '',
        imageUrl: spot.imageUrl || '',
        
        hours: spot.operatingHours || spot.hours || '',
        holiday: spot.holiday || ''
      };
    } catch (err) {
      console.error("fetchPlaceDetail 에러:", err);
      throw err;
    }
  }
  return mockPlaces.find((p) => p.id === placeId);
};

/**
 * 카카오 키워드로 장소 검색
 */
export const searchPlacesByKakao = async (query, { lat, lng } = {}) => {
  if (!KAKAO_REST_KEY) throw new Error('VITE_KAKAO_REST_KEY가 없습니다.')
  const docs = await kakaoSearchKeyword(query, { x: lng, y: lat })
  return docs.map((item) => kakaoToPlace(item))
}