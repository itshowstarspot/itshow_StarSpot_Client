import { useState, useCallback } from 'react'
import { createCourse, fetchCourses, deleteCourse, generateShareLink } from '../services/courseService'
import { COURSE_MIN_PLACES } from '../domain/course/course'

/**
 * 코스 생성 및 관리 훅
 * @returns {{ courses, selectedPlaces, addPlace, removePlace, reorderPlaces, submitCourse, loadCourses, removeCourse, shareLink, isLoading, error }}
 */
export const useCourse = () => {
  const [courses, setCourses] = useState([])
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shareLink, setShareLink] = useState(null)

  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addPlace = useCallback((place) => {
    setSelectedPlaces((prev) =>
      prev.find((p) => p.id === place.id) ? prev : [...prev, place]
    )
  }, [])

  const removePlace = useCallback((placeId) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId))
  }, [])

  const reorderPlaces = useCallback((fromIndex, toIndex) => {
    setSelectedPlaces((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [])

  const submitCourse = useCallback(async ({ title, idolId }) => {
    if (selectedPlaces.length < COURSE_MIN_PLACES) {
      setError(`코스는 최소 ${COURSE_MIN_PLACES}개의 장소가 필요합니다.`)
      return null
    }
    setIsLoading(true)
    setError(null)
    try {
      const newCourse = await createCourse({ title, idolId, places: selectedPlaces })
      setCourses((prev) => [...prev, newCourse])
      setSelectedPlaces([])
      return newCourse
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedPlaces])

  const removeCourse = useCallback(async (courseId) => {
    await deleteCourse(courseId)
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
  }, [])

  const shareCourse = useCallback((courseId) => {
    const link = generateShareLink(courseId)
    setShareLink(link)
    navigator.clipboard?.writeText(link).catch(() => {})
    return link
  }, [])

  return {
    courses, selectedPlaces,
    addPlace, removePlace, reorderPlaces,
    submitCourse, loadCourses, removeCourse, shareCourse,
    shareLink, isLoading, error,
  }
}
