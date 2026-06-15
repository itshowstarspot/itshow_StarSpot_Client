import axios from "axios";

const API_BASE_URL = "/api/users";

/**
 * 현재 로그인한 사용자의 이메일을 가져오는 헬퍼 함수
 */
const getUserEmail = () => {
  let defaultEmail = "test15@gmail.com";
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      return userObj.email || userObj.user_email || defaultEmail;
    }
  } catch (e) {
    console.error("❌ 유저 세션 파싱 에러:", e);
  }
  return defaultEmail;
};

/**
 * 방문 기록 목록 조회 (백엔드 API 연동)
 * @returns {Promise<Visit[]>}
 */
export const fetchVisits = async () => {
  const email = getUserEmail();
  try {
    const response = await axios.get(`${API_BASE_URL}/visit-history/${email}`);
    return response.data || [];
  } catch (error) {
    console.error("❌ 방문 기록 조회 실패:", error);
    throw error;
  }
};

/**
 * 방문 기록 등록 (백엔드 API 연동)
 * @param {{ placeId: string, placeName: string, date: string, memberName?: string }} data
 * @returns {Promise<Visit>}
 */
export const createVisit = async (data) => {
  if (!data.date) throw new Error("방문 날짜를 입력해주세요.");

  const email = getUserEmail();
  
  // 백엔드가 요구하는 데이터 포맷(주로 스네이크 케이스인 place_id, place_name 등)에 맞춰 매핑
  const payload = {
    email: email,
    spot_id: Number(data.placeId || data.spot_id || data.id) || null,
    date: data.date,
  };

  try {
    // 💡 백엔드의 방문 등록 엔드포인트 주소에 맞게 수정이 필요할 수 있습니다.
    const response = await axios.post(`${API_BASE_URL}/visit-history`, payload);
    return response.data;
  } catch (error) {
    console.error("❌ 방문 기록 등록 실패:", error);
    throw error;
  }
};

/**
 * 방문 기록 수정 (백엔드 API 연동)
 * @param {string|number} visitId
 * @param {Partial<Visit>} data
 * @returns {Promise<Visit>}
 */
export const updateVisit = async (visitId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/visit-history/${visitId}`, data);
    return response.data;
  } catch (error) {
    console.error("❌ 방문 기록 수정 실패:", error);
    throw error;
  }
};

/**
 * 방문 기록 삭제 (백엔드 API 연동)
 * @param {string|number} visitId
 */
export const deleteVisit = async (visitId) => {
  try {
    await axios.delete(`${API_BASE_URL}/visit-history/${visitId}`);
  } catch (error) {
    console.error("❌ 방문 기록 삭제 실패:", error);
    throw error;
  }
};