const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const mockFeeds = [
  {
    id: '1',
    placeId: '1',
    placeName: '성수동 카페',
    userId: 'user1',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    content: '정국이 왔다는 카페 다녀왔어요!',
    viewCount: 124,
    createdAt: '2026-05-10T10:00:00.000Z',
  },
  {
    id: '2',
    placeId: '2',
    placeName: '한남동 식당',
    userId: 'user2',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    content: '카리나 추천 맛집! 진짜 맛있어요.',
    viewCount: 89,
    createdAt: '2026-05-12T14:00:00.000Z',
  },
]

/**
 * 피드 목록 조회
 * @param {{ placeId?: string, sort?: 'latest' | 'popular' }} options
 * @returns {Promise<Feed[]>}
 */
export const fetchFeeds = async ({ placeId, sort = 'latest' } = {}) => {
  if (BASE_URL) {
    const params = new URLSearchParams({ sort })
    if (placeId) params.append('placeId', placeId)
    const res = await fetch(`${BASE_URL}/feeds?${params}`)
    if (!res.ok) throw new Error('피드 조회 실패')
    return res.json()
  }

  let feeds = placeId ? mockFeeds.filter((f) => f.placeId === placeId) : [...mockFeeds]
  if (sort === 'popular') feeds.sort((a, b) => b.viewCount - a.viewCount)
  else feeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return feeds
}

/**
 * 피드 등록
 * @param {{ placeId: string, image: string, content: string }} data
 * @returns {Promise<Feed>}
 */
export const createFeed = async (data) => {
  if (!data.content?.trim()) throw new Error('내용을 입력해주세요.')

  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/feeds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('피드 등록 실패')
    return res.json()
  }

  return {
    id: crypto.randomUUID(),
    ...data,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  }
}
