const STORAGE_KEY = 'starspot_favorites'

/**
 * 저장된 즐겨찾기 목록 반환
 * @returns {string[]} placeId 배열
 */
export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * 즐겨찾기 추가 (중복 방지)
 * @param {string} placeId
 */
export const addFavorite = (placeId) => {
  const favorites = getFavorites()
  if (favorites.includes(placeId)) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites, placeId]))
}

/**
 * 즐겨찾기 제거
 * @param {string} placeId
 */
export const removeFavorite = (placeId) => {
  const favorites = getFavorites().filter((id) => id !== placeId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

/**
 * 즐겨찾기 여부 확인
 * @param {string} placeId
 * @returns {boolean}
 */
export const isFavorite = (placeId) => getFavorites().includes(placeId)
