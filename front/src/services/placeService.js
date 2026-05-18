/**
 * 장소 관련 API 서비스
 * 실제 API 연동 시 BASE_URL 및 fetch 구현체 교체
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/* ── 더미 장소 데이터 (아이돌별 3개) ── */
const mockPlaces = [
  /* ── 정국 (BTS) ── */
  {
    id: 'jk-1',
    name: '성수동 어니언',
    address: '서울 성동구 아차산로9길 8',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    idolId: 'jungkook',
    category: '카페',
    lat: 37.5447,
    lng: 127.0563,
    description: '정국이 팬사인회 전날 들렀다고 알려진 성수동 베이커리 카페. 빈티지한 공장 인테리어가 인상적이에요.',
    hours: '09:00 – 22:00',
    phone: '02-1234-5678',
  },
  {
    id: 'jk-2',
    name: '한강 뚝섬 카페',
    address: '서울 광진구 강변북로 139',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    idolId: 'jungkook',
    category: '카페',
    lat: 37.5310,
    lng: 127.0677,
    description: '정국이 러닝 후 자주 들른다는 한강변 카페. 통유리 너머 한강 뷰가 시원해요.',
    hours: '10:00 – 23:00',
    phone: '02-2345-6789',
  },
  {
    id: 'jk-3',
    name: '이태원 고기집',
    address: '서울 용산구 이태원로 177',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    idolId: 'jungkook',
    category: '음식점',
    lat: 37.5347,
    lng: 126.9940,
    description: '정국이 멤버들과 회식 장소로 즐겨 찾는 이태원 프리미엄 한우 맛집.',
    hours: '17:00 – 01:00',
    phone: '02-3456-7890',
  },

  /* ── 방지민 (izna) ── */
  {
    id: 'bjm-1',
    name: '홍대 디저트 카페',
    address: '서울 마포구 와우산로 29길 24',
    image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=400&q=80',
    idolId: 'bangjeemin',
    category: '카페',
    lat: 37.5519,
    lng: 126.9240,
    description: '방지민이 SNS에 올린 딸기 케이크로 유명해진 홍대 디저트 카페.',
    hours: '11:00 – 21:00',
    phone: '02-4567-8901',
  },
  {
    id: 'bjm-2',
    name: '합정 브런치 레스토랑',
    address: '서울 마포구 독막로 78',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
    idolId: 'bangjeemin',
    category: '음식점',
    lat: 37.5497,
    lng: 126.9133,
    description: '방지민이 연습 전 자주 방문하는 브런치 맛집. 에그 베네딕트가 시그니처.',
    hours: '09:00 – 16:00',
    phone: '02-5678-9012',
  },
  {
    id: 'bjm-3',
    name: '상수 소품샵',
    address: '서울 마포구 토정로 2길 11',
    image: 'https://images.unsplash.com/photo-1555529771-122e5d9f2341?w=400&q=80',
    idolId: 'bangjeemin',
    category: '관광지',
    lat: 37.5483,
    lng: 126.9195,
    description: '방지민이 오프 때 소품 쇼핑을 즐긴다는 상수동 편집샵.',
    hours: '12:00 – 20:00',
    phone: '02-6789-0123',
  },

  /* ── 카리나 (aespa) ── */
  {
    id: 'kar-1',
    name: '청담동 파인다이닝',
    address: '서울 강남구 청담동 118-17',
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&q=80',
    idolId: 'karina',
    category: '음식점',
    lat: 37.5242,
    lng: 127.0533,
    description: '카리나가 생일 때 팀원들과 방문한 청담동 파인다이닝. 코스 요리가 유명해요.',
    hours: '12:00 – 22:00',
    phone: '02-7890-1234',
  },
  {
    id: 'kar-2',
    name: '강남 SM 근처 카페',
    address: '서울 강남구 삼성동 129-6',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    idolId: 'karina',
    category: '카페',
    lat: 37.5128,
    lng: 127.0588,
    description: 'SM 엔터테인먼트 근처에 있어 aespa 멤버들이 자주 들리는 카페.',
    hours: '08:00 – 22:00',
    phone: '02-8901-2345',
  },
  {
    id: 'kar-3',
    name: '한남동 부티크',
    address: '서울 용산구 한남동 683-139',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    idolId: 'karina',
    category: '관광지',
    lat: 37.5349,
    lng: 127.0010,
    description: '카리나가 자주 쇼핑한다는 한남동 편집 부티크 샵.',
    hours: '11:00 – 20:00',
    phone: '02-9012-3456',
  },

  /* ── Young K (DAY6) ── */
  {
    id: 'yk-1',
    name: '홍대 재즈 바',
    address: '서울 마포구 어울마당로 65',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
    idolId: 'youngk',
    category: '기타',
    lat: 37.5567,
    lng: 126.9238,
    description: 'Young K가 음악 작업 후 가끔 들른다는 홍대 라이브 재즈 바.',
    hours: '18:00 – 02:00',
    phone: '02-0123-4567',
  },
  {
    id: 'yk-2',
    name: '연남동 이탈리안',
    address: '서울 마포구 연남동 568-28',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    idolId: 'youngk',
    category: '음식점',
    lat: 37.5611,
    lng: 126.9240,
    description: 'DAY6 멤버들이 모여서 파스타를 즐기는 연남동 이탈리안 레스토랑.',
    hours: '11:30 – 21:30',
    phone: '02-1234-0000',
  },
  {
    id: 'yk-3',
    name: '마포 레코드샵',
    address: '서울 마포구 독막로 35',
    image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&q=80',
    idolId: 'youngk',
    category: '관광지',
    lat: 37.5501,
    lng: 126.9163,
    description: 'Young K가 빈티지 LP를 사러 자주 방문하는 마포 레코드샵.',
    hours: '12:00 – 21:00',
    phone: '02-2345-1111',
  },

  /* ── 이영지 ── */
  {
    id: 'lyj-1',
    name: '이태원 힙합 바',
    address: '서울 용산구 이태원로 200',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=400&q=80',
    idolId: 'leeyoungji',
    category: '기타',
    lat: 37.5351,
    lng: 126.9948,
    description: '이영지가 뮤직비디오 촬영지로 활용한 이태원 힙합 바. 분위기가 독특해요.',
    hours: '20:00 – 04:00',
    phone: '02-3456-2222',
  },
  {
    id: 'lyj-2',
    name: '성수 스트릿 버거',
    address: '서울 성동구 성수이로 78',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    idolId: 'leeyoungji',
    category: '음식점',
    lat: 37.5443,
    lng: 127.0540,
    description: '이영지가 유튜브 먹방에서 극찬한 성수동 수제버거 맛집.',
    hours: '11:00 – 22:00',
    phone: '02-4567-3333',
  },
  {
    id: 'lyj-3',
    name: '망원동 감성 카페',
    address: '서울 마포구 망원동 409-11',
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&q=80',
    idolId: 'leeyoungji',
    category: '카페',
    lat: 37.5559,
    lng: 126.9027,
    description: '이영지가 쉬는 날 혼자 노트북 들고 작업한다는 망원동 감성 카페.',
    hours: '10:00 – 22:00',
    phone: '02-5678-4444',
  },
]

/**
 * 아이돌별 장소 목록 조회
 * @param {string} idolId
 * @returns {Promise<Place[]>}
 */
export const fetchPlacesByIdol = async (idolId) => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/places?idolId=${idolId}`)
    if (!res.ok) throw new Error('장소 목록 조회 실패')
    return res.json()
  }
  return mockPlaces.filter((p) => p.idolId === idolId)
}

/**
 * 장소 검색
 * @param {string} query
 * @param {string} [idolId]
 * @returns {Promise<Place[]>}
 */
export const searchPlaces = async (query, idolId) => {
  if (BASE_URL) {
    const params = new URLSearchParams({ query })
    if (idolId) params.append('idolId', idolId)
    const res = await fetch(`${BASE_URL}/places/search?${params}`)
    if (!res.ok) throw new Error('장소 검색 실패')
    return res.json()
  }
  return mockPlaces.filter(
    (p) =>
      (p.name.includes(query) || p.description?.includes(query)) &&
      (!idolId || p.idolId === idolId)
  )
}

/**
 * 장소 상세 조회
 * @param {string} placeId
 * @returns {Promise<Place>}
 */
export const fetchPlaceDetail = async (placeId) => {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/places/${placeId}`)
    if (!res.ok) throw new Error('장소 상세 조회 실패')
    return res.json()
  }
  const place = mockPlaces.find((p) => p.id === placeId)
  if (!place) throw new Error('장소를 찾을 수 없습니다.')
  return place
}
