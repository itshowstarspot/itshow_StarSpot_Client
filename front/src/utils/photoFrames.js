import { places } from '../data/places'

const FRAME_COUNT = 3

const FRAME_ID_BY_IDOL = {
  jungkook: 'jungkook',
  bangjeemin: 'jeemin',
  karina: 'karina',
  youngk: 'youngk',
  leeyoungji: 'youngji',
}

export function getFramePlaceNumber(placeId, idolId) {
  if (!placeId) return 1

  const place = places.find((item) => item.id === placeId)
  const targetIdolId = place?.idolId || idolId
  if (!targetIdolId) return 1

  const idolPlaces = places.filter((item) => item.idolId === targetIdolId)
  const placeIndex = idolPlaces.findIndex((item) => item.id === placeId)

  return placeIndex === -1 ? 1 : (placeIndex % FRAME_COUNT) + 1
}

export function getPhotoFrameSrc({ idolId, placeId } = {}) {
  const place = placeId ? places.find((item) => item.id === placeId) : null
  const frameId = FRAME_ID_BY_IDOL[place?.idolId || idolId]

  if (!frameId) return null

  return `/frames/frame_${frameId}_${getFramePlaceNumber(placeId, place?.idolId || idolId)}.svg`
}
