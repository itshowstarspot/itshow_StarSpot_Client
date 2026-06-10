const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 피드 이미지는 /public/feeds/ 폴더에 이미지 파일을 넣고 파일명을 여기에 작성하세요.
// 예: feed1.jpg → '/feeds/feed1.jpg'
const mockFeeds = [
  {
    id: '1',
    placeId: '1',
    placeName: '성수동 카페',
    userId: 'user1',
    image: '/feeds/feed1.jpg',
    content: '정국이 왔다는 카페 다녀왔어요!',
    viewCount: 124,
    createdAt: '2026-05-10T10:00:00.000Z',
  },
  {
    id: '2',
    placeId: '2',
    placeName: '한남동 식당',
    userId: 'user2',
    image: '/feeds/feed2.jpg',
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
    try {
      const params = new URLSearchParams({ sort });
      if (placeId) params.append('placeId', placeId);
      
      const res = await fetch(`${BASE_URL}/api/feeds?${params}`);
      if (!res.ok) throw new Error('피드 목록 조회 실패');
      
      const dbFeeds = await res.json();
      
      return dbFeeds.map(feed => ({
        id: String(feed.id),
        placeId: String(feed.place_id || placeId),
        placeName: feed.location_name || '성지순례 장소',
        userId: feed.user_email || '익명',
        nickname: feed.nickname || '익명',
        content: feed.content,
        
        // [★핵심] 백엔드의 photo_path를 프론트의 image로 매핑하여 리뷰 사진 로딩!
        image: feed.photo_path || '', 
        
        createdAt: feed.created_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error("fetchFeeds API 에러:", err);
      throw err;
    }
  }
  
  let feeds = placeId ? mockFeeds.filter((f) => f.placeId === placeId) : [...mockFeeds];
  if (sort === 'popular') feeds.sort((a, b) => b.viewCount - a.viewCount);
  else feeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return feeds;
};

/**
 * 피드 등록
 * @param {{ placeId: string, image: string, content: string }} data
 * @returns {Promise<Feed>}
 */
export const createFeed = async (data) => {
  if (!data.content?.trim()) throw new Error('내용을 입력해주세요.')

  if (BASE_URL) {
    // [수정] 등록할 때도 백엔드 라우터 규칙에 맞게 /api/feeds 로 경로 수정
    const res = await fetch(`${BASE_URL}/api/feeds`, {
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