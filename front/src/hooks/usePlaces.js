import { useEffect, useState, useCallback } from 'react'
import { fetchPlacesByIdol, searchPlaces } from '../services/placeService'

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
      const data = await fetchPlacesByIdol(idolId)
      setPlaces(data)
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
    if (category !== '전체') result = result.filter((p) => p.category === category)
    if (query.trim()) result = result.filter((p) => p.name.includes(query.trim()))
    setFilteredPlaces(result)
  }, [places, category, query])

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(places)
      return
    }
    setIsLoading(true)
    try {
      const data = await searchPlaces(searchQuery, idolId)
      setFilteredPlaces(data)
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
