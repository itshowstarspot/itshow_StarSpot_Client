const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 피드 mock 데이터
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
]

/**
 * 피드 목록 조회
 */
export const fetchFeeds = async ({ placeId, sort = 'latest' } = {}) => {
  if (BASE_URL) {
    try {
      const params = new URLSearchParams({ sort });
      if (placeId) params.append('placeId', placeId);
      
      const res = await fetch(`${BASE_URL}/feeds?${params}`);
      if (!res.ok) throw new Error('피드 목록 조회 실패');
      
      const dbFeeds = await res.json();
      
      return dbFeeds.map(feed => {
        // 🔍 백엔드 SQL 결과물에서 데이터가 꼬이지 않도록 안전장치 마련
        // 올려주신 데이터 순서에 따르면 장소 이름은 아래 필드 중 하나에 들어있습니다.
        const actualPlaceName = feed.place_name || feed.course_name || feed.location_name;
        
        return {
          id: String(feed.id || feed.feed_id || feed.place_id || '0'),
          // 데이터 맨 끝에 들어오는 장소 식별자 숫자 매핑 (예: 11, 12)
          placeId: String(feed.place_id || placeId),
          
          // 🌟 [핵심 수정] 만약 아이돌 이름(세븐틴, 에스파)이 장소명으로 잘못 들어왔다면, 
          // 다른 주소나 코스 필드를 대체해서 매칭하도록 분기 처리합니다.
          placeName: (actualPlaceName === feed.idol_name || actualPlaceName === feed.name)
            ? (feed.address || '성지순례 장소') 
            : (actualPlaceName || '성지순례 장소'),
            
          userId: feed.user_email || feed.userId || '익명',
          nickname: feed.nickname || '익명',
          content: feed.content || feed.review_text || '',
          
          // 🌟 이미지 경로 문제 해결 (/uploads/ 또는 base64 데이터 대응)
          image: feed.image || feed.photo_path || feed.photoSrc || '', 
          createdAt: feed.created_at || feed.createdAt || new Date().toISOString()
        };
      });
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
 */
export const createFeed = async (data) => {
  if (!data.content?.trim()) throw new Error('내용을 입력해주세요.');

  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/feeds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('피드 등록 실패');
    const result = await res.json();

    return {
      id: String(result.id),
      placeId: String(data.placeId),
      placeName: data.placeName,
      userId: data.userEmail || '익명',
      nickname: data.nickname || '익명',
      content: result.content || data.content,
      image: result.image || result.photo_path || data.image || '',
      createdAt: new Date().toISOString()
    };
  }

  return {
    id: crypto.randomUUID(),
    ...data,
    userId: data.userEmail || 'user1',
    nickname: data.nickname || '익명',
    viewCount: 0,
    createdAt: new Date().toISOString(),
  };
};