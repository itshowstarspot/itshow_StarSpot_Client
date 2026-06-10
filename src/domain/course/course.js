/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} idolId
 * @property {Place[]} places
 * @property {string} createdAt
 * @property {boolean} [isRecommended]
 */

/**
 * 코스 생성 최소 장소 수
 */
export const COURSE_MIN_PLACES = 2

/**
 * 빈 Course 기본값 반환
 * @returns {Course}
 */
export const createEmptyCourse = () => ({
  id: '',
  title: '',
  idolId: '',
  places: [],
  createdAt: new Date().toISOString(),
  isRecommended: false,
})
