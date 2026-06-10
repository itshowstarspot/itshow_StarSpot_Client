/**
 * @typedef {Object} Visit
 * @property {string} id
 * @property {string} placeId
 * @property {string} placeName
 * @property {string} date - 'YYYY-MM-DD'
 * @property {string} [photo]
 * @property {string} [memo]
 */

/**
 * 빈 Visit 기본값 반환
 * @returns {Visit}
 */
export const createEmptyVisit = () => ({
  id: '',
  placeId: '',
  placeName: '',
  date: new Date().toISOString().slice(0, 10),
  photo: '',
  memo: '',
})
