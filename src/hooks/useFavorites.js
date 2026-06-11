import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'

/**
 * 유저별 즐겨찾기 상태 관리 훅 (서버 연동 완결본)
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])

  // 🌟 현재 로그인한 유저의 이메일을 로컬스토리지에서 실시간으로 가져오는 함수
  const getLoggedInUserEmail = () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser?.email || null;
  };

  // 🌟 useFavorites.js 파일 안에서 fetchFavorites 함수 부분을 교체하세요!
const fetchFavorites = useCallback(async () => {
  const userEmail = getLoggedInUserEmail();
  if (!userEmail) {
    setFavorites([]);
    return;
  }

  try {
    const response = await axios.get('/api/users/favorites', {
      params: { userEmail }
    });
    
    // 🌟 [핵심 방어 코드] response.data가 진짜 배열인지 확인하고, 아니면 빈 배열로 대체합니다!
    const data = Array.isArray(response.data) ? response.data : [];

    // 이제 안전하게 정제된 데이터(data)를 기반으로 map을 돌립니다.
    const favoriteIds = data.map(place => String(place.id));
    setFavorites(favoriteIds);
  } catch (error) {
    console.error("서버에서 즐겨찾기 목록을 불러오는 중 실패:", error);
    setFavorites([]); // 에러 발생 시 상태 초기화로 화면 먹통 방지
  }
}, []);

  // 유저가 바뀌거나 첫 로드 시 자동으로 내 즐겨찾기만 불러옴
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);


  // 2. 🌟 [토글] 별표 클릭 시 서버 DB에 추가/삭제 요청
  const toggleFavorite = useCallback(async (placeId) => {
    const userEmail = getLoggedInUserEmail();
    if (!userEmail) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    const stringId = String(placeId);
    const isAlreadyFav = favorites.includes(stringId);

    try {
      if (isAlreadyFav) {
        // ❌ 이미 즐겨찾기라면 -> 서버 DB에서 삭제 요청
        // (본인의 삭제 API 구조나 주소에 맞게 URL을 변경하세요)
        await axios.delete(`/api/users/favorites`, {
          data: { userEmail, spotId: stringId }
        });
        
        // 프론트 상태 동기화
        setFavorites(prev => prev.filter(id => id !== stringId));
      } else {
        //  즐겨찾기가 아니라면 -> 서버 DB에 추가 요청
        // (본인의 추가 API 구조나 주소에 맞게 URL을 변경하세요)
        await axios.post(`/api/users/favorites`, {
          userEmail,
          spotId: stringId
        });
        
        // 프론트 상태 동기화
        setFavorites(prev => [...prev, stringId]);
      }
    } catch (error) {
      console.error("즐겨찾기 토글 처리 중 서버 에러:", error);
      // 에러 발생 시 최신 상태로 서버 데이터 재동기화
      fetchFavorites();
    }
  }, [favorites, fetchFavorites]);


  // 3. 🌟 [체크] 특정 장소가 내 즐겨찾기 목록에 포함되어 있는지 판단 (별표 채우기용)
  const checkFavorite = useCallback((placeId) => {
    return favorites.includes(String(placeId));
  }, [favorites]);

  return { favorites, toggleFavorite, checkFavorite, refetchFavorites: fetchFavorites }
}