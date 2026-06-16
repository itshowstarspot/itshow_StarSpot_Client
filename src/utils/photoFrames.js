const FRAME_COUNT = 3

const FRAME_ID_BY_IDOL = {
  jungkook: 'jungkook',
  jimin_bang: 'jeemin',
  karina: 'karina',
  youngk: 'youngk',
  leeyoungji: 'youngji',
}

export function getFramePlaceNumber(placeId, idolId) {
  if (!placeId) return 1

  const idNum = typeof placeId === 'number' 
    ? placeId 
    : parseInt(placeId.toString().replace(/[^0-9]/g, '')) || 1;

  return (idNum % FRAME_COUNT) + 1
}

export function getPhotoFrameSrc({ idolId, placeId } = {}) {
  const targetIdolId = idolId || 'karina'
  const frameId = FRAME_ID_BY_IDOL[targetIdolId]

  if (!frameId) return null

  const frameNumber = getFramePlaceNumber(placeId, targetIdolId)
  
  return `/frames/frame_${frameId}_${frameNumber}.svg`
}