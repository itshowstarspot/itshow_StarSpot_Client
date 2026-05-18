import { useState, useCallback } from 'react'
import { getFavorites, addFavorite, removeFavorite, isFavorite } from '../services/favoriteService'

/**
 * 즐겨찾기 상태 관리 훅
 * @returns {{ favorites, toggleFavorite, checkFavorite }}
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState(getFavorites)

  const toggleFavorite = useCallback((placeId) => {
    if (isFavorite(placeId)) {
      removeFavorite(placeId)
    } else {
      addFavorite(placeId)
    }
    setFavorites(getFavorites())
  }, [])

  const checkFavorite = useCallback((placeId) => favorites.includes(placeId), [favorites])

  return { favorites, toggleFavorite, checkFavorite }
}
