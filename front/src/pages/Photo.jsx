import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Photo.css'
import { saveCapturedPhotos } from '../utils/photoStorage'

const MAX_SHOTS = 5
const COUNTDOWN_SECONDS = 5
const FRAME_SRC = '/frames/frame1_1.svg'

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={filled ? 'filled' : ''}>
      <path d="M32 4.8 39.8 22l18.7 2.1-13.9 12.7 3.8 18.4L32 45.8 15.6 55.2l3.8-18.4L5.5 24.1 24.2 22 32 4.8Z" />
    </svg>
  )
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default function Photo() {
  const navigate = useNavigate()
  const videoRef       = useRef(null)
  const streamRef      = useRef(null)
  const previewCanvasRef = useRef(null)  // 화면에 보이는 캔버스 (카메라 미리보기)
  const animationRef   = useRef(null)
  const frameImgRef    = useRef(null)
  const capturesRef    = useRef([])
  const isCapturingRef = useRef(false)

  const [cameraReady, setCameraReady]   = useState(false)
  const [cameraError, setCameraError]   = useState('')
  const [shotCount, setShotCount]       = useState(0)
  const [captures, setCaptures]         = useState([])
  const [countdown, setCountdown]       = useState(null)

  // 프레임 미리 로드
  useEffect(() => {
    loadImage(FRAME_SRC)
      .then((img) => { frameImgRef.current = img })
      .catch(() => { frameImgRef.current = null })
  }, [])

  // 카메라 시작
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 24, max: 30 },
          },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        setCameraError('카메라 권한을 허용하면 함께 사진을 찍을 수 있어요.')
      }
    }

    startCamera()

    return () => {
      cancelAnimationFrame(animationRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // 카메라 영상 → 캔버스 미러 렌더링 루프 (배경제거 없이 그대로)
  useEffect(() => {
    if (!cameraReady) return

    function renderFrame() {
      const video  = videoRef.current
      const canvas = previewCanvasRef.current
      if (!canvas || !video || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderFrame)
        return
      }

      const ctx = canvas.getContext('2d')
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width  = video.videoWidth  || 960
        canvas.height = video.videoHeight || 540
      }

      // 좌우 반전 (셀카 모드)
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.restore()

      animationRef.current = requestAnimationFrame(renderFrame)
    }

    renderFrame()
    return () => cancelAnimationFrame(animationRef.current)
  }, [cameraReady])

  // 사진 촬영 — 카메라 영상 + 프레임만
  const capturePhoto = useCallback(() => {
    if (isCapturingRef.current || capturesRef.current.length >= MAX_SHOTS) return
    isCapturingRef.current = true

    try {
      const video = videoRef.current
      if (!video || video.readyState < 2) return

      const w = video.videoWidth || 1080
      const h = video.videoHeight || 1920
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      // 카메라 (미러 반전 해제)
      ctx.save()
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, w, h)
      ctx.restore()

      // 프레임 오버레이
      if (frameImgRef.current) {
        ctx.drawImage(frameImgRef.current, 0, 0, w, h)
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.88)
      const nextCaptures = [imageData, ...capturesRef.current].slice(0, MAX_SHOTS)

      capturesRef.current = nextCaptures
      setCaptures(nextCaptures)
      setShotCount(nextCaptures.length)

      if (nextCaptures.length >= MAX_SHOTS) {
        saveCapturedPhotos(nextCaptures)
        setTimeout(() => navigate('/photoselect'), 300)
      }
    } finally {
      isCapturingRef.current = false
    }
  }, [navigate])

  // 카운트다운 시작
  useEffect(() => {
    if (!cameraReady || cameraError || countdown !== null || shotCount >= MAX_SHOTS) return
    const timer = setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 800)
    return () => clearTimeout(timer)
  }, [cameraReady, cameraError, countdown, shotCount])

  // 카운트다운 tick
  useEffect(() => {
    if (countdown === null) return
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null)
        capturePhoto()
      } else {
        setCountdown((v) => v - 1)
      }
    }, 1)
    return () => clearTimeout(timer)
  }, [countdown, capturePhoto])

  return (
    <main className="photo-page">
      {/* 숨겨진 video (스트림 소스) */}
      <video
        ref={videoRef}
        className="photo-video-source"
        autoPlay playsInline muted
        onCanPlay={() => setCameraReady(true)}
      />

      {/* 카메라 미리보기 캔버스 — 전체화면 */}
      <canvas
        ref={previewCanvasRef}
        className={`photo-camera ${cameraReady ? 'is-ready' : ''}`}
      />

      {/* 프레임 오버레이 */}
      <img className="photo-frame-overlay" src={FRAME_SRC} alt="" />

      <section className="photo-shot-counter" aria-label={`촬영 횟수 ${shotCount}/${MAX_SHOTS}`}>
        {Array.from({ length: MAX_SHOTS }, (_, i) => (
          <StarIcon key={i} filled={i < shotCount} />
        ))}
      </section>

      {countdown !== null && (
        <div className="photo-countdown" aria-live="assertive">{countdown}</div>
      )}

      {cameraError && (
        <div className="photo-controls"><p>{cameraError}</p></div>
      )}

      {captures.length > 0 && (
        <aside className="photo-captures" aria-label="촬영한 사진">
          {captures.slice(0, MAX_SHOTS).map((src, i) => (
            <img src={src} alt={`촬영 결과 ${captures.length - i}`} key={src} />
          ))}
        </aside>
      )}
    </main>
  )
}
