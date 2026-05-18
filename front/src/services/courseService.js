import { COURSE_MIN_PLACES } from '../domain/course/course'

const STORAGE_KEY = 'starspot_courses'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/* ── 기본 더미 코스 ── */
const DEFAULT_COURSES = [
  {
    id: 'default-course-1',
    title: '정국과 함께하는 서울 성수 투어',
    idolId: 'jungkook',
    isRecommended: true,
    createdAt: '2025-05-01T10:00:00.000Z',
    places: [
      {
        id: 'jk-1',
        name: '성수동 어니언',
        address: '서울 성동구 아차산로9길 8',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
        category: '카페',
        lat: 37.5447,
        lng: 127.0563,
        description: '정국이 팬사인회 전날 들렀다고 알려진 성수동 베이커리 카페.',
      },
      {
        id: 'jk-2',
        name: '한강 뚝섬 카페',
        address: '서울 광진구 강변북로 139',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
        category: '카페',
        lat: 37.5310,
        lng: 127.0677,
        description: '정국이 러닝 후 자주 들른다는 한강변 카페.',
      },
      {
        id: 'jk-3',
        name: '이태원 고기집',
        address: '서울 용산구 이태원로 177',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
        category: '음식점',
        lat: 37.5347,
        lng: 126.9940,
        description: '정국이 멤버들과 회식 장소로 즐겨 찾는 이태원 프리미엄 한우 맛집.',
      },
    ],
  },
]

const getLocalCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    // 저장된 데이터가 없으면 기본 코스 반환
    if (!saved) return DEFAULT_COURSES
    return saved
  } catch {
    return DEFAULT_COURSES
  }
}

const saveLocalCourses = (courses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

/**
 * 코스 목록 조회
 * @returns {Promise<Course[]>}
 */
export const fetchCourses = async () => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/courses`)
    if (!res.ok) throw new Error('코스 목록 조회 실패')
    return res.json()
  }
  return getLocalCourses()
}

/**
 * 코스 생성
 * @param {{ title: string, idolId: string, places: Place[] }} data
 * @returns {Promise<Course>}
 */
export const createCourse = async (data) => {
  if (data.places.length < COURSE_MIN_PLACES) {
    throw new Error(`코스는 최소 ${COURSE_MIN_PLACES}개의 장소가 필요합니다.`)
  }

  const newCourse = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  }

  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
    })
    if (!res.ok) throw new Error('코스 생성 실패')
    return res.json()
  }

  const courses = getLocalCourses()
  const updated = [...courses, newCourse]
  saveLocalCourses(updated)
  return newCourse
}

/**
 * 코스 삭제
 * @param {string} courseId
 */
export const deleteCourse = async (courseId) => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('코스 삭제 실패')
    return
  }
  saveLocalCourses(getLocalCourses().filter((c) => c.id !== courseId))
}

/**
 * 코스 공유 링크 생성
 * @param {string} courseId
 * @returns {string}
 */
export const generateShareLink = (courseId) => {
  return `${window.location.origin}/course/${courseId}`
}
