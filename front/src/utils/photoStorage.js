/**
 * 촬영된 사진 sessionStorage 유틸리티
 * PhotoSelect와 PlaceDetailModal에 중복 구현되어 있던 로직을 통합합니다.
 */
import { SESSION_KEY_PHOTO_CAPTURES } from '../constants/storageKeys'

/**
 * sessionStorage에서 촬영된 사진 목록을 읽어옵니다.
 * @returns {{ id: string, src: string }[]}
 */
export function readCapturedPhotos() {
  try {
    const data = JSON.parse(sessionStorage.getItem(SESSION_KEY_PHOTO_CAPTURES) || '[]')
    if (!Array.isArray(data)) return []
    return data
      .filter((src) => typeof src === 'string' && src.startsWith('data:image/'))
      .map((src, index) => ({ id: `capture-${index + 1}`, src }))
  } catch {
    return []
  }
}

/**
 * sessionStorage에서 촬영된 사진 목록을 삭제합니다.
 */
export function clearCapturedPhotos() {
  sessionStorage.removeItem(SESSION_KEY_PHOTO_CAPTURES)
}

/**
 * sessionStorage에 촬영된 사진 목록을 저장합니다.
 * @param {string[]} photos - base64 data URL 배열
 */
export function saveCapturedPhotos(photos) {
  sessionStorage.setItem(SESSION_KEY_PHOTO_CAPTURES, JSON.stringify(photos))
}
