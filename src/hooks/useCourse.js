import { useState, useCallback } from 'react';
import axios from 'axios';

// ⭕ 백엔드 서버 기본 주소 설정
const API_BASE_URL = '/api';

export function useCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //  코스 목록 불러오기
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = user?.email;

      // 쿼리 스트링 파라미터로 올바르게 전송
      const params = userEmail ? { userEmail } : {};
      const response = await axios.get(`${API_BASE_URL}/courses`, { params });

      const data = response.data?.data ?? response.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useCourse] 코스 로드 실패:', err);
      setError(err.response?.data?.message || '코스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 코스 생성 시 장소 추가
  const addPlace = useCallback((place) => {
    setSelectedPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      const next = [...prev, place];
      console.log('[useCourse] 장소 추가됨:', next);
      return next;
    });
  }, []);

  // 코스 생성 시 장소 제거
  const removePlace = useCallback((placeId) => {
    setSelectedPlaces((prev) => {
      const next = prev.filter((p) => p.id !== placeId);
      console.log('[useCourse] 장소 제거됨:', next);
      return next;
    });
  }, []);

  // 장소 순서 조정
  const reorderPlaces = useCallback((startIndex, endIndex) => {
    setSelectedPlaces((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // 코스 서버 전송 처리 (POST /api/courses)
  const submitCourse = useCallback(async ({ title }) => {
    setIsLoading(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = user?.email || 'test14@gmail.com';

    if (selectedPlaces.length === 0) {
      const errMsg = '선택된 장소가 없습니다. 최소 1개 이상의 장소를 선택해 주세요.';
      setError(errMsg);
      setIsLoading(false);
      alert(errMsg);
      return false;
    }

    try {
      const spotIds = selectedPlaces.map(p => {
        const rawId = String(p.id);
        const onlyNumbers = rawId.replace(/[^0-9]/g, '');
        return onlyNumbers ? Number(onlyNumbers) : null;
      }).filter(id => id !== null);

      const requestBody = {
        title: title,
        spotIds: spotIds,
        userEmail: userEmail,
      };

      const response = await axios.post(`${API_BASE_URL}/courses`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSelectedPlaces([]); 
      await loadCourses();   
      return true;
    } catch (err) {
      console.error('🔥 [useCourse] 서버 전송 오류 발생:', err);
      setError(err.response?.data?.message || '코스 등록 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlaces, loadCourses]);

  // 코스 수정
  const updateCourse = useCallback(async (courseId, { title, places }) => {
    setIsLoading(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = user?.email;

    try {
      const spotIds = places.map(p => {
        const rawId = String(p.id);
        const onlyNumbers = rawId.replace(/[^0-9]/g, '');
        return onlyNumbers ? Number(onlyNumbers) : null;
      }).filter(id => id !== null);

      const requestBody = {
        title: title,
        spotIds: spotIds,
        userEmail: userEmail,
      };

      const response = await axios.post(`${API_BASE_URL}/courses-update-bypass/${courseId}`, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('🎯 [useCourse] 코스 수정 성공:', response.data);
      
      await loadCourses();
      return true;
    } catch (err) {
      console.error('🔥 [useCourse] 코스 수정 오류 발생:', err);
      setError(err.response?.data?.message || '코스 수정 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses]);

  // 코스 삭제
  const removeCourse = useCallback(async (courseId) => {
    if (!window.confirm('정말 이 코스를 삭제하시겠습니까?')) return;

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = user?.email;

    try {
      await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
        data: { userEmail },
      });
      await loadCourses();
    } catch (err) {
      console.error('[useCourse] 코스 삭제 실패:', err);
      alert(err.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    }
  }, [loadCourses]);
  
  // 코스 링크 공유
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
    updateCourse, 
    loadCourses,
    removeCourse,
    shareCourse
  };
}