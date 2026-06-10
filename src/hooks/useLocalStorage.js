import { useState, useEffect } from 'react'

/**
 * localStorage와 동기화되는 state 훅
 * @template T
 * @param {string} key - localStorage 키
 * @param {T} initialValue - 초기값
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 저장 실패 시 무시 (private browsing 등)
    }
  }, [key, value])

  return [value, setValue]
}
