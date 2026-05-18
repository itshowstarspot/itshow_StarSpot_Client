const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

let loadPromise = null

export const loadKakaoMapSdk = () => {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao?.maps?.Map) {
      resolve()
      return
    }

    if (!KAKAO_APP_KEY) {
      reject(new Error('.env에 VITE_KAKAO_MAP_KEY가 없습니다.'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`

    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }

    script.onerror = () => {
      loadPromise = null
      reject(new Error('카카오 맵 스크립트 로드 실패 (네트워크 또는 도메인 미등록 확인)'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}
