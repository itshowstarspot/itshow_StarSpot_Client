import { COURSE_MIN_PLACES } from '../domain/course/course'
import { STORAGE_KEY_COURSES } from '../constants/storageKeys'

// ✅ 백엔드 포트 5000번과 공통 경로 /api 적용
const API_BASE_URL = 'http://localhost:5000/api'

/* ── 추천 코스 고정 데이터 (오프라인/대비용) ── */
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
]

// 🌟 [수정] 로컬 스토리지 'user' 객체에서 이메일 문자열만 파싱하여 추출하는 안전장치
const getAuthHeaders = () => {
  try {
    const userStorage = localStorage.getItem('user')
    if (userStorage) {
      // 문자열로 되어 있는 객체를 JSON으로 변환
      const parsedUser = JSON.parse(userStorage)
      // 객체 내부의 email 주소만 추출 (예: test15@gmail.com)
      const userEmail = parsedUser.email || parsedUser.userEmail
      
      if (userEmail) {
        return { 'Authorization': `Bearer ${userEmail}` }
      }
    }
  } catch (error) {
    console.error("로컬 스토리지 인증 정보 파싱 실패:", error)
  }
  return {}
}

const getLocalCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES) || 'null')
    return saved || []
  } catch {
    return []
  }
}

const saveLocalCourses = (courses) => {
  localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses))
}

/**
 * 추천 코스 조회
 */
export const fetchRecommendedCourses = async (idolId) => {
  try {
    const params = new URLSearchParams({ recommended: 'true' })
    if (idolId) params.append('idolId', idolId)
    const res = await fetch(`${API_BASE_URL}/courses?${params}`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return idolId
      ? RECOMMENDED_COURSES.filter((c) => c.idolId === idolId)
      : RECOMMENDED_COURSES
  }
}

/**
 * 일반 코스 목록 조회
 */
export const fetchCourses = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return getLocalCourses()
  }
}

/**
 * 코스 생성 (🌟 토큰 헤더 반영 및 패킷 정형화 버전)
 */
export const createCourse = async (data) => {
  if (data.places.length < COURSE_MIN_PLACES) {
    throw new Error(`코스는 최소 ${COURSE_MIN_PLACES}개의 장소가 필요합니다.`)
  }

  // 🌟 백엔드 실제 테이블 스펙에 맞춤 (존재하지 않는 description 전달 방지)
  const payload = {
    title: data.title,
    spotIds: data.places.map((place) => Number(place.id))
  }

  try {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() // 🌟 파싱된 진짜 이메일 주소가 전달됩니다!
      },
      body: JSON.stringify(payload),
    })
    
    if (!res.ok) {
      console.warn(`서버 오류 코드: ${res.status} - 로컬 스토리지에 임시 저장 처리합니다.`);
      throw new Error()
    }
    
    return await res.json()
  } catch {
    const newCourse = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    const courses = getLocalCourses()
    saveLocalCourses([...courses, newCourse])
    return newCourse
  }
}

/**
 * 코스 삭제
 */
export const deleteCourse = async (courseId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
  } catch {
    saveLocalCourses(getLocalCourses().filter((c) => c.id !== courseId))
  }
}

/**
 * 코스 공유 링크 생성
 */
export const generateShareLink = (courseId) => {
  return `${window.location.origin}/course/${courseId}`
}