import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'

/**
 * 유저별 즐겨찾기 상태 관리 훅 (Vite 프록시 대응 완결본)
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])

  // 🌟 현재 로그인한 유저의 이메일을 로컬스토리지에서 가져오는 함수
  const getLoggedInUserEmail = () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser?.email || null;
  };

  // 1. 🌟 [조회] 현재 로그인한 유저의 즐겨찾기 목록 가져오기
  const fetchFavorites = useCallback(async () => {
    const userEmail = getLoggedInUserEmail();
    if (!userEmail) {
      setFavorites([]);
      return;
    }

    try {
      // ⚠️ 맨 앞에 반드시 슬래시(/)가 붙은 '/api/users/favorites' 여야 프록시가 작동합니다!
      const response = await axios.get('/api/users/favorites', {
        params: { userEmail }
      });
      
      const data = Array.isArray(response.data) ? response.data : [];
      const favoriteIds = data.map(place => String(place.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("서버에서 즐겨찾기 목록을 불러오는 중 실패:", error);
      setFavorites([]);
    }
  }, []);

  // 첫 로드 및 컴포넌트 마운트 시 자동 실행
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);


  // 2. 🌟 [토글] 별표 클릭 시 백엔드 서버(5000번)로 추가/삭제 요청
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
        // ❌ 이미 즐겨찾기라면 -> 서버 DB에서 삭제 요청 (DELETE)
        await axios.delete('/api/users/favorites', {
          data: { userEmail, spotId: stringId }
        });
        
        setFavorites(prev => prev.filter(id => id !== stringId));
      } else {
        // 🌟 즐겨찾기가 아니라면 -> 서버 DB에 추가 요청 (POST)
        await axios.post('/api/users/favorites', {
          userEmail,
          spotId: stringId
        });
        
        setFavorites(prev => [...prev, stringId]);
      }
    } catch (error) {
      console.error("즐겨찾기 토글 처리 중 서버 에러:", error);
      // 에러 발생 시 최신 상태 리프레시
      fetchFavorites();
    }
  }, [favorites, fetchFavorites]);


  // 3. 🌟 [체크] 특정 장소가 내 즐겨찾기 리스트에 있는지 검사
  const checkFavorite = useCallback((placeId) => {
    return favorites.includes(String(placeId));
  }, [favorites]);

  return { favorites, toggleFavorite, checkFavorite, refetchFavorites: fetchFavorites }
}