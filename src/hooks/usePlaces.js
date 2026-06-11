import { useEffect, useState, useCallback } from 'react'
import { fetchPlacesByIdol, searchPlaces } from '../services/placeService'

/** 영문 카테고리를 프론트엔드용 한글 카테고리로 변환해주는 매핑 함수 */
function mapEngCategoryToKor(engCategory) {
  if (!engCategory) return '기타';
  const clean = engCategory.trim().toLowerCase();
  if (clean === 'cafe') return '카페';
  if (clean === 'restaurant') return '음식점';
  if (clean === 'playground' || clean === 'tour') return '관광지';
  return '기타';
}

/**
 * 장소 데이터 로딩 및 필터 상태 관리 훅
 * @param {string} idolId
 * @returns {{ places, filteredPlaces, isLoading, error, category, setCategory, query, setQuery, refetch }}
 */
export const usePlaces = (idolId) => {
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('전체')
  const [query, setQuery] = useState('')

  const loadPlaces = useCallback(async () => {
    if (!idolId) return
    setIsLoading(true)
    setError(null)
    try {
      // 🌟 현재 로그인한 유저 정보 획득
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userEmail = savedUser?.email || savedUser?.user_email || "";

      // 백엔드 조회 시 유저 정보를 함께 넘겨 유저별 즐겨찾기(isFavorite 등)가 매핑된 데이터를 받습니다.
      const data = await fetchPlacesByIdol(idolId, userEmail)
      
      // [★매핑 치트키★] 백엔드의 영문 카테고리를 프론트의 한글 버튼 상태와 일치시킵니다.
      const mappedData = data.map(place => ({
        ...place,
        category: mapEngCategoryToKor(place.category)
      }));
      
      console.log("포착된 idolId:", idolId, "로그인된 유저:", userEmail);
      console.log("한글 카테고리로 변환 완료된 데이터 목록:", mappedData);
      
      setPlaces(mappedData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [idolId])
  
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
      result = result.filter((p) => p.name.includes(query.trim()))
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
      const mappedSearchData = data.map(place => ({
        ...place,
        category: mapEngCategoryToKor(place.category)
      }));
      setFilteredPlaces(mappedSearchData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [idolId, places])

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