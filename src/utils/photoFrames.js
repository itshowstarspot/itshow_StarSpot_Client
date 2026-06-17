const FRAME_ID_BY_IDOL = {
  jungkook: 'jungkook',
  jimin_bang: 'jeemin',
  karina: 'karina',
  youngk: 'youngk',
  leeyoungji: 'youngji',
}

// 장소 ID → 프레임 번호 직접 지정 (겹치지 않게 순서대로)
const PLACE_FRAME_MAP = {
  // 정국 (id 1~7, 프레임 6개)
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 1,
  // 방지민 (id 8~13)
  8: 1, 9: 2, 10: 3, 11: 4, 12: 5, 13: 6,
  // 카리나 (id 14~19)
  14: 1, 15: 2, 16: 3, 17: 4, 18: 5, 19: 6,
  // 영케이 (id 20~25)
  20: 1, 21: 2, 22: 3, 23: 4, 24: 5, 25: 6,
  // 이영지 (id 26~31)
  26: 1, 27: 2, 28: 3, 29: 4, 30: 5, 31: 6,
}

export function getPhotoFrameSrc({ idolId, placeId } = {}) {
  const targetIdolId = idolId || 'karina'
  const frameId = FRAME_ID_BY_IDOL[targetIdolId]
  if (!frameId) return null

  const id = placeId ? Number(placeId) : null
  const frameNumber = (id && PLACE_FRAME_MAP[id]) ? PLACE_FRAME_MAP[id] : 1

  return `/frames/frame_${frameId}_${frameNumber}.svg`
}
