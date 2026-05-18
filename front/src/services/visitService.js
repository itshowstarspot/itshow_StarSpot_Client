const STORAGE_KEY = 'starspot_visits'

const getLocalVisits = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveLocalVisits = (visits) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits))
}

/**
 * 방문 기록 목록 조회
 * @returns {Promise<Visit[]>}
 */
export const fetchVisits = async () => getLocalVisits()

/**
 * 방문 기록 등록
 * @param {{ placeId: string, placeName: string, date: string, photo?: string, memo?: string }} data
 * @returns {Promise<Visit>}
 */
export const createVisit = async (data) => {
  if (!data.date) throw new Error('방문 날짜를 입력해주세요.')

  const newVisit = { id: crypto.randomUUID(), ...data }
  saveLocalVisits([...getLocalVisits(), newVisit])
  return newVisit
}

/**
 * 방문 기록 수정
 * @param {string} visitId
 * @param {Partial<Visit>} data
 * @returns {Promise<Visit>}
 */
export const updateVisit = async (visitId, data) => {
  const visits = getLocalVisits()
  const idx = visits.findIndex((v) => v.id === visitId)
  if (idx === -1) throw new Error('방문 기록을 찾을 수 없습니다.')

  const updated = { ...visits[idx], ...data }
  visits[idx] = updated
  saveLocalVisits(visits)
  return updated
}

/**
 * 방문 기록 삭제
 * @param {string} visitId
 */
export const deleteVisit = async (visitId) => {
  saveLocalVisits(getLocalVisits().filter((v) => v.id !== visitId))
}
