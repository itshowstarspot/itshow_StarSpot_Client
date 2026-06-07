import { COURSE_MIN_PLACES } from '../domain/course/course'
import { STORAGE_KEY_COURSES } from '../constants/storageKeys'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/* ── 추천 코스 데이터 ── */
const RECOMMENDED_COURSES = [
  {
    id: 'rec-jk-1',
    title: '정국 강남 맛집 투어',
    idolId: 'jungkook',
    isRecommended: true,
    description: '정국이 멤버들과 자주 찾던 강남 식당들을 따라가보세요',
    createdAt: '2026-01-01T00:00:00.000Z',
    places: [
      { id: 'jk-2', name: '질할브로스 청담점', address: '서울특별시 강남구 압구정로79길 32 1층', category: '음식점', lat: 37.52698, lng: 127.0498, description: '방탄 정국과 갓세븐 유겸이 방문한 양식집' },
      { id: 'jk-3', name: '우돈청', address: '서울특별시 강남구 언주로 170길 37', category: '음식점', lat: 37.52661, lng: 127.0367, description: '정국이 구칠즈 멤버들과 함께 식사한 곳' },
      { id: 'jk-4', name: '꽃새우 영번지 역삼점', address: '서울특별시 강남구 언주로 536', category: '음식점', lat: 37.50619, lng: 127.0413, description: '정국이 왔다간 해산물요리 전문점' },
    ],
  },
  {
    id: 'rec-jk-2',
    title: '정국 이태원 코스',
    idolId: 'jungkook',
    isRecommended: true,
    description: '이태원에서 정국의 발자취를 따라가보세요',
    createdAt: '2026-01-02T00:00:00.000Z',
    places: [
      { id: 'jk-8', name: '이태원화로', address: '서울특별시 용산구 이태원로27가길 51', category: '음식점', lat: 37.5349, lng: 126.9946, description: '광화문 공연 후 정국이 방문했던 식당' },
      { id: 'jk-10', name: '현대카드 바이닐앤플라스틱', address: '서울특별시 용산구 이태원로 248', category: '관광지', lat: 37.5344, lng: 126.9994, description: 'Dynamite 라이브버전을 촬영한 곳' },
    ],
  },
  {
    id: 'rec-bjm-1',
    title: '방지민 성수 카페 투어',
    idolId: 'bangjeemin',
    isRecommended: true,
    description: '방지민이 즐겨 찾는 성수동 카페들을 방문해보세요',
    createdAt: '2026-01-03T00:00:00.000Z',
    places: [
      { id: 'bjm-1', name: '자연도소금빵 성수점', address: '서울특별시 성동구 연무장길 56-1', category: '카페', lat: 37.5458, lng: 127.0584, description: '추석 연휴에 소금빵을 웨이팅하던 지민 목격' },
      { id: 'bjm-3', name: '마망젤라또 성수점', address: '서울특별시 성동구 연무장9길 8 1층', category: '카페', lat: 37.5449, lng: 127.0563, description: '리센느 인스타에 올라온 두바이쫀득젤라또를 먹는 지민' },
    ],
  },
  {
    id: 'rec-kar-1',
    title: '카리나 서울 나들이',
    idolId: 'karina',
    isRecommended: true,
    description: '카리나와 멤버들이 함께한 서울 스팟',
    createdAt: '2026-01-04T00:00:00.000Z',
    places: [
      { id: 'kar-1', name: '실비옥', address: '서울특별시 성동구 아차산로 126', category: '음식점', lat: 37.5484, lng: 127.0629, description: '지젤과 카리나가 방문한 식당' },
      { id: 'kar-3', name: '오잇 oeat', address: '서울특별시 용산구 신흥로 95', category: '카페', lat: 37.5358, lng: 126.9883, description: '카리나와 지젤이 직접 방문하여 사진을 올린 크로플 전문 카페' },
      { id: 'kar-2', name: '롯데월드', address: '서울특별시 송파구 올림픽로 240', category: '관광지', lat: 37.5111, lng: 127.0987, description: '윈터와 카리나가 간 놀이공원' },
    ],
  },
  {
    id: 'rec-yk-1',
    title: 'DAY6 영케이 투어',
    idolId: 'youngk',
    isRecommended: true,
    description: '영케이와 DAY6의 흔적을 따라가보세요',
    createdAt: '2026-01-05T00:00:00.000Z',
    places: [
      { id: 'yk-3', name: '빨간떡', address: '서울특별시 구로구 도림로20길', category: '음식점', lat: 37.4942, lng: 126.8879, description: '영케이의 개인 채널인 YBC에서 소개한 떡볶이 집' },
      { id: 'yk-2', name: '캐리비안베이', address: '경기도 용인시 처인구 포곡읍 에버랜드로 199', category: '관광지', lat: 37.2933, lng: 127.2024, description: '워크맨 81화 캐리비안베이 알바 촬영' },
    ],
  },
  {
    id: 'rec-lyj-1',
    title: '이영지 곱창 투어',
    idolId: 'leeyoungji',
    isRecommended: true,
    description: '이영지 또간집 픽! 최애 곱창집 코스',
    createdAt: '2026-01-06T00:00:00.000Z',
    places: [
      { id: 'lyj-1', name: '대박곱창 본점', address: '서울특별시 양천구 오목로 170 1층', category: '음식점', lat: 37.5265, lng: 126.8627, description: '이영지의 야곱 성지 2등 픽' },
      { id: 'lyj-2', name: '울타리곱창', address: '서울특별시 양천구 오목로 일대', category: '음식점', lat: 37.5260, lng: 126.8635, description: "이영지 '또간집' 1등 야채곱창" },
    ],
  },
  {
    id: 'rec-jh-1',
    title: 'NCT 재현 서울 투어',
    idolId: 'jaehyun',
    isRecommended: true,
    description: '채널NCT에서 재현이 방문한 서울 스팟',
    createdAt: '2026-01-07T00:00:00.000Z',
    places: [
      { id: 'jh-2', name: '도쿄수플레', address: '서울특별시 강남구 압구정로10길 35 1층', category: '카페', lat: 37.52128, lng: 127.0222, description: '태용이와 재현만의 수플레를 만든 곳' },
      { id: 'jh-3', name: '커피탐이나', address: '서울특별시 마포구 잔다리로3안길 31', category: '카페', lat: 37.55017, lng: 126.9194, description: 'JCC에서 쟈니와 재현이 바리스타 체험을 한 카페' },
      { id: 'jh-4', name: '잠수교', address: '서울특별시 서초구 반포동', category: '관광지', lat: 37.51466, lng: 126.9964, description: 'NCT127 Hello! #SEOUL 포토북 장소' },
    ],
  },
]

/* ── 내 코스 더미 ── */
const DEFAULT_COURSES = []

const getLocalCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES) || 'null')
    // 저장된 데이터가 없으면 기본 코스 반환
    if (!saved) return DEFAULT_COURSES
    return saved
  } catch {
    return DEFAULT_COURSES
  }
}

const saveLocalCourses = (courses) => {
  localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses))
}

/**
 * 추천 코스 조회
 * @param {string} [idolId] - 아이돌 필터 (없으면 전체)
 * @returns {Promise<Course[]>}
 */
export const fetchRecommendedCourses = async (idolId) => {
  if (BASE_URL) {
    const params = new URLSearchParams({ recommended: 'true' })
    if (idolId) params.append('idolId', idolId)
    const res = await fetch(`${BASE_URL}/courses?${params}`)
    if (!res.ok) throw new Error('추천 코스 조회 실패')
    return res.json()
  }
  return idolId
    ? RECOMMENDED_COURSES.filter((c) => c.idolId === idolId)
    : RECOMMENDED_COURSES
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
