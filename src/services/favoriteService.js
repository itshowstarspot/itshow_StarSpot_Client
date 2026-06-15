import axios from 'axios'
import { STORAGE_KEY_FAVORITES as STORAGE_KEY } from '../constants/storageKeys'

// ✅ 8080 포트 통신 거부 버그 원천 해결: 5000번 포트로 원천 고정
const API_BASE_URL = '/api'

// 인증 헤더 추출 공통 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * 즐겨찾기 목록 캐시 반환
 */
export const getFavorites = () => {
  syncWithBackend()

  try {
    const localData = localStorage.getItem(STORAGE_KEY)
    if (!localData) return []
    const parsed = JSON.parse(localData)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * 백엔드 즐겨찾기 목록 백그라운드 동기화 (✅ /api/favorites로 깔끔하게 요청 발송)
 */
const syncWithBackend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/favorites`, { headers: getAuthHeader() })
    if (response.data && Array.isArray(response.data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data))
    }
  } catch (error) {
    console.warn('DB 연결 실패: 로컬 스토리지 데이터로 안전하게 구동 중입니다.')
  }
}

/**
 * 즐겨찾기 추가
 */
export const addFavorite = async (placeId) => {
  const favorites = getFavorites()
  if (favorites.includes(String(placeId))) return

  const updated = [...favorites, String(placeId)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

  try {
    await axios.post(`${API_BASE_URL}/favorites`, { placeId }, { headers: getAuthHeader() })
  } catch (error) {
    console.error('서버 추가 실패 (로컬만 반영됨)', error)
  }
}

/**
 * 즐겨찾기 제거
 */
export const removeFavorite = async (placeId) => {
  const favorites = getFavorites().filter((id) => id !== String(placeId))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))

  try {
    await axios.delete(`${API_BASE_URL}/favorites/${placeId}`, { headers: getAuthHeader() })
  } catch (error) {
    console.error('서버 삭제 실패 (로컬만 반영됨)', error)
  }
}

/**
 * 즐겨찾기 여부 확인
 */
export const isFavorite = (placeId) => {
  return getFavorites().includes(String(placeId))
}