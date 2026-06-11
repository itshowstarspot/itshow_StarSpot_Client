import { useState, useCallback } from 'react';
import axios from 'axios';

// ⭕ 백엔드 서버 기본 주소 설정
const API_BASE_URL = 'http://localhost:5000/api'; 

export function useCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. 내 코스 목록 불러오기 (GET /api/courses)
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = user?.email;

      // 백엔드의 GET /api/courses 엔드포인트 호출
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: {
          // 토큰 기반 통신 보완 (백엔드 getEmailFromToken용 Authorization 헤더 전송)
          'Authorization': `Bearer ${userEmail || 'test14@gmail.com'}`
        }
      });
      
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[useCourse] 코스 로드 실패:', err);
      setError(err.response?.data?.message || '코스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. 코스 생성 시 장소 추가
  const addPlace = useCallback((place) => {
    setSelectedPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      const next = [...prev, place];
      console.log('[useCourse] 장소 추가됨:', next);
      return next;
    });
  }, []);

  // 3. 코스 생성 시 장소 제거
  const removePlace = useCallback((placeId) => {
    setSelectedPlaces((prev) => {
      const next = prev.filter((p) => p.id !== placeId);
      console.log('[useCourse] 장소 제거됨:', next);
      return next;
    });
  }, []);

  // 4. 장소 순서 조정
  const reorderPlaces = useCallback((startIndex, endIndex) => {
    setSelectedPlaces((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // 5. 코스 서버 전송 처리 (POST /api/courses)
  const submitCourse = useCallback(async ({ title }) => {
    setIsLoading(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = user?.email || 'test14@gmail.com'; // 폴백 이메일

    console.log('[useCourse.submitCourse] 백엔드 전송 전 최종 검증:', {
      title,
      userEmail,
      selectedPlaces
    });

    if (selectedPlaces.length === 0) {
      const errMsg = '선택된 장소가 없습니다. 최소 1개 이상의 장소를 선택해 주세요.';
      setError(errMsg);
      setIsLoading(false);
      alert(errMsg);
      return false;
    }

    try {
      // 백엔드가 요구하는 형태인 순수한 숫자형 spotIds 배열 추출
      const spotIds = selectedPlaces.map(p => {
        const rawId = String(p.id);
        const onlyNumbers = rawId.replace(/[^0-9]/g, '');
        return onlyNumbers ? Number(onlyNumbers) : null;
      }).filter(id => id !== null);

      // ⭕ 백엔드 POST /api/courses 스펙에 완벽 맞춤 JSON 본문 구성
      const requestBody = {
        title: title,
        spotIds: spotIds
      };

      const response = await axios.post(`${API_BASE_URL}/courses`, requestBody, {
        headers: { 
          'Content-Type': 'application/json',
          // 백엔드의 getEmailFromToken이 이 헤더를 찢어서 이메일로 인지함
          'Authorization': `Bearer ${userEmail}`
        }
      });

      console.log('🎯 [useCourse] 코스 생성 성공 서버 응답:', response.data);
      
      setSelectedPlaces([]); // 선택 슬롯 초기화
      await loadCourses();   // 목록 즉시 새로고침
      return true;
    } catch (err) {
      console.error('🔥 [useCourse] 서버 전송 오류 발생:', err);
      setError(err.response?.data?.message || '코스 등록 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlaces, loadCourses]);

  // 6. 코스 삭제 (DELETE /api/courses/:id)
  const removeCourse = useCallback(async (courseId) => {
    if (!window.confirm('정말 이 코스를 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/courses/${courseId}`);
      await loadCourses();
    } catch (err) {
      console.error('[useCourse] 코스 삭제 실패:', err);
      alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    }
  }, [loadCourses]);

  // 7. 코스 링크 공유
  const shareCourse = useCallback((courseId) => {
    const shareUrl = `${window.location.origin}/course/share/${courseId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => console.log('[useCourse] 공유 링크 복사 완료'))
      .catch((err) => console.error('[useCourse] 링크 복사 실패:', err));
  }, []);

  return {
    courses,
    selectedPlaces,
    isLoading,
    error,
    addPlace,
    removePlace,
    reorderPlaces,
    submitCourse,
    loadCourses,
    removeCourse,
    shareCourse
  };
}