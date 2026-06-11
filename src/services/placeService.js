import { places as mockPlaces } from '../data/places'

// 백엔드 API 주소 및 환경 변수 고정
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

/** 아이돌별 장소 목록 조회 */
export const fetchPlacesByIdol = async (idolId) => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/spots`); 
    if (!res.ok) throw new Error('장소 목록 조회 실패');
    const allSpots = await res.json();

    return allSpots.map((spot) => ({
      // 🔥 [수정] 백엔드에서 넘겨주는 ID 컬럼명(placeId 등)을 우선적으로 받도록 안전장치 마련
      id: String(spot.placeId || spot.id || spot.spotId), 
      name: spot.placeName || spot.place_name || spot.name,          
      address: spot.address,
      category: spot.category || '기타',
      lat: Number(spot.latitude || spot.lat),    
      lng: Number(spot.longitude || spot.lng),   
      description: spot.description || '',
      image: spot.imageUrl || '',
      imageUrl: spot.imageUrl || '',
      hours: spot.operatingHours || '',
      holiday: spot.holiday || ''
    }));
  }
  return mockPlaces.filter((p) => p.idolId === idolId);
}

/** 장소 검색 API */
export const searchPlaces = async (query, idolId) => {
  if (BASE_URL) {
    const params = new URLSearchParams();
    if (query && query.trim() !== '') {
      params.append('idolId', query.trim());
    } else if (idolId) {
      params.append('idolId', idolId);
    }

    const res = await fetch(`${BASE_URL}/places?${params}`);
    if (!res.ok) throw new Error('장소 검색 실패');
    
    const spots = await res.json();
    return spots.map(spot => ({
      // 🔥 [수정] 동일하게 안전한 ID 매핑 적용
      id: String(spot.placeId || spot.id || spot.spotId),
      name: spot.placeName || spot.name,
      placeName: spot.placeName || spot.name,
      address: spot.address,
      category: spot.category || '기타',
      lat: Number(spot.latitude || spot.lat),
      lng: Number(spot.longitude || spot.lng),
      description: spot.description || '',
      image: spot.imageUrl || '',
      imageUrl: spot.imageUrl || '',
      hours: spot.operatingHours || '',
      holiday: spot.holiday || ''
    }));
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

/** 장소 상세 조회 */
export const fetchPlaceDetail = async (placeId) => {
  // 🛡️ [추가 예외 처리] placeId가 아예 없거나 문자열 "undefined"이면 요청 자체를 차단
  if (!placeId || placeId === 'undefined') {
    console.error("⚠️ 유효하지 않은 placeId로 상세 조회가 요청되었습니다.");
    return null; 
  }

  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/places/${placeId}`);
      if (!res.ok) throw new Error('장소 상세 정보 조회 실패');
      const spot = await res.json();
      
      return {
        // 🔥 [수정] 동일하게 안전한 ID 매핑 적용
        id: String(spot.placeId || spot.id || spot.spotId),
        name: spot.placeName || spot.name,
        address: spot.address,
        category: spot.category || '기타',
        lat: Number(spot.latitude || spot.lat),
        lng: Number(spot.longitude || spot.lng),
        description: spot.description || '',
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

/** 카카오 키워드로 장소 검색 */
export const searchPlacesByKakao = async (query, { lat, lng } = {}) => {
  if (!KAKAO_REST_KEY) throw new Error('VITE_KAKAO_REST_KEY가 없습니다.')
  const docs = await kakaoSearchKeyword(query, { x: lng, y: lat })
  return docs.map((item) => kakaoToPlace(item))
}

/** 외부 지도 플랫폼 길찾기 URL 생성 및 이동 함수 */
export const openExternalMapRoute = (start, end, platform = 'kakao') => {
  if (!end || !end.lat || !end.lng) {
    alert('도착지 정보가 올바르지 않습니다.');
    return;
  }

  const startName = start?.name || '출발지';
  const endName = end.name || '목적지';

  if (platform === 'naver') {
    const naverUrl = start?.lat && start?.lng
      ? `https://map.naver.com/v5/dir/${start.lng},${start.lat},${encodeURIComponent(startName)}/${end.lng},${end.lat},${encodeURIComponent(endName)}/-/transit`
      : `https://map.naver.com/v5/search/${encodeURIComponent(endName)}`;
    
    window.open(naverUrl, '_blank');
  } else {
    const kakaoUrl = start?.lat && start?.lng
      ? `https://map.kakao.com/link/from/${encodeURIComponent(startName)},${start.lat},${start.lng}/to/${encodeURIComponent(endName)},${end.lat},${end.lng}`
      : `https://map.kakao.com/link/to/${encodeURIComponent(endName)},${end.lat},${end.lng}`;
    
    window.open(kakaoUrl, '_blank');
  }
};