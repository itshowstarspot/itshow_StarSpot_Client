/**
 * @typedef {Object} Place
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} image
 * @property {string} idolId
 * @property {string} category - '음식점' | '카페' | '관광지' | '기타'
 * @property {number} lat
 * @property {number} lng
 * @property {string} [description]
 */

export const placeCategories = ['전체', '음식점', '카페', '관광지', '기타']

/**
 * 빈 Place 기본값 반환
 * @returns {Place}
 */
export const createEmptyPlace = () => ({
  id: '',
  name: '',
  address: '',
  image: '',
  idolId: '',
  category: '기타',
  lat: 37.5665,
  lng: 126.978,
  description: '',
})
