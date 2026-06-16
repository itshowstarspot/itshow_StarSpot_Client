import { useEffect, useState, useCallback } from 'react'
import { fetchPlacesByIdol, searchPlaces } from '../services/placeService'
import axios from 'axios'

function mapEngCategoryToKor(engCategory) {
  if (!engCategory) return '기타';
  const clean = engCategory.trim().toLowerCase();
  if (clean === 'cafe') return '카페';
  if (clean === 'restaurant') return '음식점';
  if (clean === 'playground' || clean === 'tour') return '관광지';
  return '기타';
}

// 🎯 대소문자 및 매칭 억까를 방지하기 위해 완전 차단 주머니 구성
const IDOL_NAME_MAP = {
  'jungkook': { group: ['방탄소년단', 'bts'], member: ['정국', 'jungkook'] },
  'bts': { group: ['방탄소년단', 'bts'], member: ['정국', 'jungkook'] },
  '방탄소년단': { group: ['방탄소년단', 'bts'], member: ['정국', 'jungkook'] },
  '정국': { group: ['방탄소년단', 'bts'], member: ['정국', 'jungkook'] },
  
  // 🎯 Izna, izna, 방지민, 지민 모두 엮이도록 완전 동기화
  'jimin_bang': { group: ['izna', '이즈나'], member: ['방지민', '지민', 'jimin'] },
  'jimin': { group: ['izna', '이즈나'], member: ['방지민', '지민', 'jimin'] },
  'izna': { group: ['izna', '이즈나'], member: ['방지민', '지민', 'jimin'] },
  '방지민': { group: ['izna', '이즈나'], member: ['방지민', '지민', 'jimin'] },
  
  'karina': { group: ['aespa', '에스파'], member: ['카리나', 'karina'] },
  'aespa': { group: ['aespa', '에스파'], member: ['카리나', 'karina'] },
  '카리나': { group: ['aespa', '에스파'], member: ['카리나', 'karina'] },
  
  'youngk': { group: ['day6', '데이식스'], member: ['영케이', 'young k', 'youngk'] },
  'day6': { group: ['day6', '데이식스'], member: ['영케이', 'young k', 'youngk'] },
  '영케이': { group: ['day6', '데이식스'], member: ['영케이', 'young k', 'youngk'] },
  
  'leeyoungji': { group: ['이영지', 'leeyoungji'], member: ['이영지', 'youngji'] },
  'youngji': { group: ['이영지', 'leeyoungji'], member: ['이영지', 'youngji'] },
  '이영지': { group: ['이영지', 'leeyoungji'], member: ['이영지', 'youngji'] }
};

export const usePlaces = (idolId) => {
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('전체')
  const [query, setQuery] = useState('')

  const transformPlaceData = useCallback((dataArray) => {
    return (Array.isArray(dataArray) ? dataArray : []).map(place => {
      const lat = place.latitude || place.lat;
      const lng = place.longitude || place.lng;
      const img = place.image_url || place.imageUrl || place.image || place.spot_image || place.img || place.photo_path;

      const finalName = 
        place.placeName || 
        place.place_name || 
        place.location_name || 
        place.name || 
        place.title || 
        '성지 순례지';
      
      const finalContent = place.description || place.content || '아티스트의 발자취가 담긴 성지입니다.';

      return {
        ...place,
        name: finalName,            
        title: finalName,           
        place_name: finalName,      
        placeName: finalName,       
        location_name: finalName,   
        content: finalContent,      
        description: finalContent,  
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

  // 🎯 어떤 문자열 조합이 들어오든 철저하게 그물망식으로 필터링하는 로직 고도화
  const filterExactIdol = useCallback((dataArray, currentIdolId) => {
    if (!currentIdolId || !dataArray || dataArray.length === 0) return [];
    
    const key = String(currentIdolId).toLowerCase().trim();
    const mapping = IDOL_NAME_MAP[key];
    
    if (mapping) {
      return dataArray.filter(place => {
        const dbGroup = place.group_name ? String(place.group_name).toLowerCase().trim() : "";
        const dbMember = place.member_name ? String(place.member_name).toLowerCase().trim() : "";
        const dbIdolName = place.idol_name ? String(place.idol_name).toLowerCase().trim() : "";
        
        // 그룹명이 상호 매칭되거나 (izna <-> Izna)
        const matchGroup = mapping.group.some(g => dbGroup.includes(g) || g.includes(dbGroup) || dbIdolName.includes(g));
        // 멤버명이 상호 매칭되거나 (방지민, 지민 <-> 방지민)
        const matchMember = mapping.member ? mapping.member.some(m => dbMember.includes(m) || m.includes(dbMember) || dbIdolName.includes(m)) : false;
        
        return matchGroup || matchMember;
      });
    }

    return dataArray.filter(place => {
      const gName = place.group_name ? String(place.group_name).toLowerCase() : "";
      const mName = place.member_name ? String(place.member_name).toLowerCase() : "";
      const iName = place.idol_name ? String(place.idol_name).toLowerCase() : "";
      return gName.includes(key) || mName.includes(key) || iName.includes(key);
    });
  }, []);

  const loadPlaces = useCallback(async () => {
    if (!idolId) return;
    
    setIsLoading(true)
    setError(null)
    let rawData = [];

    try {
      const key = String(idolId).toLowerCase().trim();
      const mapping = IDOL_NAME_MAP[key];
      
      // 백엔드로 보낼 파라미터 조율: '방지민' 전송 보장
      let finalIdolParam = idolId;
      if (mapping) {
        finalIdolParam = (mapping.member && mapping.member[0]) || mapping.group[0];
      }

      const response = await axios.get('/api/places', {
        params: { idolId: finalIdolParam }
      });
      
      if (Array.isArray(response.data)) {
        rawData = response.data;
      }
      
      if (rawData.length === 0) {
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userEmail = savedUser?.email || savedUser?.user_email || "";
        const fallbackData = await fetchPlacesByIdol(idolId, userEmail);
        if (Array.isArray(fallbackData)) {
          rawData = fallbackData;
        }
      }

      const processedData = filterExactIdol(rawData, idolId);
      const mappedData = transformPlaceData(processedData);
      
      setPlaces(mappedData)
    } catch (err) {
      console.error("장소 데이터 바인딩 프로세스 오류:", err);
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [idolId, transformPlaceData, filterExactIdol])
  
  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

  useEffect(() => {
    let result = [...places]
    if (category !== '전체') {
      result = result.filter((p) => p.category === category)
    }
    if (query.trim()) {
      result = result.filter((p) => p.name && p.name.toLowerCase().includes(query.trim().toLowerCase()))
    }
    setFilteredPlaces(result)
  }, [places, category, query])

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