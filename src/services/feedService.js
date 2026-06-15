const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * 피드 목록 조회
 */
export const fetchFeeds = async ({ placeId, sort = 'latest', userEmail } = {}) => {
  try {
    const params = new URLSearchParams({ sort });
    if (placeId) params.append('placeId', placeId);
    if (userEmail) params.append('userEmail', userEmail);

    const res = await fetch(`${BASE_URL}/feeds?${params}`);
    if (!res.ok) throw new Error('피드 목록 조회 실패');

    const dbFeeds = await res.json();

    return dbFeeds.map(feed => ({
      id: String(feed.id || '0'),
      placeId: String(feed.placeId || feed.place_id || placeId || ''),
      placeName: feed.place_name || feed.location_name || '성지순례 장소',
      userEmail: feed.user_email || '',
      nickname: feed.nickname || '익명',
      content: feed.content || '',
      image: feed.image || feed.photo_path || '',
      createdAt: feed.created_at || feed.createdAt || new Date().toISOString()
    }));
  } catch (err) {
    console.error("fetchFeeds API 에러:", err);
    throw err;
  }
};

/**
 * 피드 등록 (이미지: JSON base64, 동영상: FormData)
 */
export const createFeed = async (data) => {
  if (!data.content?.trim()) throw new Error('내용을 입력해주세요.');

  let res;

  if (data.mediaFile) {
    const formData = new FormData();
    formData.append('image', data.mediaFile);
    formData.append('content', data.content);
    formData.append('placeId', data.placeId || '');
    formData.append('userEmail', data.userEmail || '');
    formData.append('nickname', data.nickname || '익명');

    res = await fetch(`${BASE_URL}/feeds`, {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(`${BASE_URL}/feeds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  if (!res.ok) throw new Error('피드 등록 실패');
  const result = await res.json();

  return {
    id: String(result.id),
    placeId: String(data.placeId),
    placeName: data.placeName || '',
    userEmail: data.userEmail || '',
    nickname: data.nickname || '익명',
    content: data.content,
    image: result.image || result.photo_path || data.image || '',
    createdAt: new Date().toISOString()
  };
};

/**
 * 피드 수정
 */
export const updateFeed = async (id, content) => {
  const res = await fetch(`${BASE_URL}/feeds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('피드 수정 실패');
  return res.json();
};

/**
 * 피드 삭제
 */
export const deleteFeed = async (id) => {
  const res = await fetch(`${BASE_URL}/feeds/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('피드 삭제 실패');
  return res.json();
};
