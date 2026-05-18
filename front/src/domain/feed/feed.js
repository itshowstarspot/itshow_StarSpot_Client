/**
 * @typedef {Object} Feed
 * @property {string} id
 * @property {string} placeId
 * @property {string} placeName
 * @property {string} userId
 * @property {string} image
 * @property {string} content
 * @property {number} viewCount
 * @property {string} createdAt
 */

/**
 * 피드 정렬 기준
 */
export const feedSortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
]

/**
 * 빈 Feed 기본값 반환
 * @returns {Feed}
 */
export const createEmptyFeed = () => ({
  id: '',
  placeId: '',
  placeName: '',
  userId: '',
  image: '',
  content: '',
  viewCount: 0,
  createdAt: new Date().toISOString(),
})
