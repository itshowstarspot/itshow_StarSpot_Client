import { useEffect, useState, useCallback } from 'react'
import { fetchPlacesByIdol, searchPlaces } from '../services/placeService'
import axios from 'axios'

/** 영문 카테고리를 프론트엔드용 한글 카테고리로 변환해주는 매핑 함수 */
function mapEngCategoryToKor(engCategory) {
  if (!engCategory) return '기타';
  const clean = engCategory.trim().toLowerCase();
  if (clean === 'cafe') return '카페';
  if (clean === 'restaurant') return '음식점';
  if (clean === 'playground' || clean === 'tour') return '관광지';
  return '기타';
}

/** * 🎯 아티스트 식별자 통합 매핑 사전
 * SQL DB에 들어있는 대소문자 규격('Izna', '방탄소년단', '이영지')과 완벽 매칭하도록 정비
 */
const IDOL_NAME_MAP = {
  // 방탄소년단 정국 관련
  'jungkook': { group: '방탄소년단', member: '정국' },
  'bts': { group: '방탄소년단', member: '정국' },
  '방탄소년단': { group: '방탄소년단', member: '정국' },
  '정국': { group: '방탄소년단', member: '정국' },
  
  // izna 방지민 관련 (대소문자 무관하게 SQL 데이터인 'Izna'에 맞춤)
  'jimin': { group: 'Izna', member: '방지민' },
  'jimin_bang': { group: 'Izna', member: '방지민' },
  'jiminb': { group: 'Izna', member: '방지민' },
  'bangjimin': { group: 'Izna', member: '방지민' },
  'izna': { group: 'Izna', member: '방지민' },
  '방지민': { group: 'Izna', member: '방지민' },
  
  // 에스파 카리나 관련
  'karina': { group: 'aespa', member: '카리나' },
  'aespa': { group: 'aespa', member: '카리나' },
  '카리나': { group: 'aespa', member: '카리나' },
  
  // 데이식스 영케이 관련
  'youngk': { group: 'day6', member: '영케이' },
  'day6': { group: 'day6', member: '영케이' },
  '영케이': { group: 'day6', member: '영케이' },
  
  // 이영지 관련
  'youngji': { group: '이영지', member: null },
  'leeyoungji': { group: '이영지', member: null },
  '이영지': { group: '이영지', member: null }
};

export const usePlaces = (idolId) => {
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('전체')
  const [query, setQuery] = useState('')

  // 데이터 규격 및 이미지 변수명 방어선 일원화
  const transformPlaceData = useCallback((dataArray) => {
    return (Array.isArray(dataArray) ? dataArray : []).map(place => {
      const lat = place.latitude || place.lat;
      const lng = place.longitude || place.lng;
      const img = place.image_url || place.imageUrl || place.image || place.spot_image || place.img;

      return {
        ...place,
        name: place.place_name || place.name || '이름 없음',
        category: mapEngCategoryToKor(place.category),
        latitude: lat ? parseFloat(lat) : 37.5665,
        longitude: lng ? parseFloat(lng) : 126.9780,
        lat: lat ? parseFloat(lat) : 37.5665,
        lng: lng ? parseFloat(lng) : 126.9780,
        image_url: img || '',
        imageUrl: img || '', 
        image: img || '',
        spot_image: img || '',
        img: img || ''
      };
    });
  }, []);

  // 아티스트 완전 동기화 필터 (대소문자 무관하게 완전 철벽 방어)
  const filterExactIdol = useCallback((dataArray, currentIdolId) => {
    if (!currentIdolId || !dataArray || dataArray.length === 0) return [];
    
    const key = String(currentIdolId).toLowerCase().trim();
    const mapping = IDOL_NAME_MAP[key];
    
    if (mapping) {
      return dataArray.filter(place => {
        const dbGroup = place.group_name ? String(place.group_name).toLowerCase().trim() : "";
        const dbMember = place.member_name ? String(place.member_name).toLowerCase().trim() : "";
        
        const targetGroup = mapping.group.toLowerCase();
        const targetMember = mapping.member ? mapping.member.toLowerCase() : null;

        if (targetMember) {
          return dbGroup === targetGroup && dbMember === targetMember;
        } else {
          return dbGroup === targetGroup;
        }
      });
    }

    return dataArray.filter(place => {
      const gName = place.group_name ? String(place.group_name).toLowerCase() : "";
      const mName = place.member_name ? String(place.member_name).toLowerCase() : "";
      return gName.includes(key) || mName.includes(key) || key.includes(gName) || key.includes(mName);
    });
  }, []);

  const loadPlaces = useCallback(async () => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = savedUser?.email || savedUser?.user_email || "";
    
    if (!idolId && !userEmail) return
    
    setIsLoading(true)
    setError(null)
    
    let rawData = [];

    try {
      // 1. 🎯 [수정 완료] 백엔드에 전송할 때 현재 활성화된 idolId를 무조건 파라미터로 함께 주입!
      if (userEmail) {
        const response = await axios.get('http://localhost:5000/api/spots/favorite-idol', {
          params: { 
            email: userEmail,
            idolId: idolId // 👈 백엔드가 이영지로 롤백하지 못하게 확실히 잠금
          }
        });
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          rawData = response.data.data;
        } else if (Array.isArray(response.data)) {
          rawData = response.data;
        }
      } 
      
      // 2. 백업 예비 조회선 실행
      if (rawData.length === 0 && idolId) {
        const fallbackData = await fetchPlacesByIdol(idolId, userEmail);
        if (Array.isArray(fallbackData)) {
          rawData = fallbackData;
        }
      }

      // 3. 필터링 및 매핑 데이터 가공
      const processedData = filterExactIdol(rawData, idolId);
      const mappedData = transformPlaceData(processedData);
      
      console.log(`[usePlaces 갱신 완료] 타겟 아티스트: "${idolId}" | 출력 성지: ${mappedData.length}개`);
      setPlaces(mappedData)
    } catch (err) {
      console.error("장소 데이터 바인딩 실패:", err);
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [idolId, transformPlaceData, filterExactIdol])
  
  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

  // 카테고리 + 검색어 필터 적용
  useEffect(() => {
    let result = [...places]
    if (category !== '전체') {
      result = result.filter((p) => p.category === category)
    }
    if (query.trim()) {
      result = result.filter((p) => p.name && p.name.includes(query.trim()))
    }
    setFilteredPlaces(result)
  }, [places, category, query])

  // 검색 로직
  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(places)
      return
    }
    setIsLoading(true)
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = savedUser?.email || savedUser?.user_email || "";

      const data = await searchPlaces(searchQuery, idolId, userEmail)
      const matchedData = filterExactIdol(data, idolId);
      const mappedSearchData = transformPlaceData(matchedData);
      setFilteredPlaces(mappedSearchData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [idolId, places, transformPlaceData, filterExactIdol])

  return {
    places,
    filteredPlaces,
    isLoading,
    error,
    category,
    setCategory,
    query,
    setQuery,
    search,
    refetch: loadPlaces,
  }
}