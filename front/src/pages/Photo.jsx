import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@mediapipe/selfie_segmentation'
import './Photo.css'

const MAX_SHOTS = 5
const COUNTDOWN_SECONDS = 5
const PHOTO_CAPTURE_STORAGE_KEY = 'starspot.photoCaptures'
const SEGMENT_INTERVAL_MS = 120
const CAPTURE_WIDTH = 1280
const CAPTURE_HEIGHT = 720
const PERSON_BOX = {
  x: 0.224,
  y: 0.167,
  width: 0.333,
  height: 0.787,
}
const IDOL_BOX = {
  x: 0.583,
  y: 0.12,
  width: 0.297,
  height: 0.778,
}
const backgroundImage =
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=2400&q=90'
const idolImage =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90'

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={filled ? 'filled' : ''}>
      <path d="M32 4.8 39.8 22l18.7 2.1-13.9 12.7 3.8 18.4L32 45.8 15.6 55.2l3.8-18.4L5.5 24.1 24.2 22 32 4.8Z" />
    </svg>
  )
}

function drawCover(ctx, image, x, y, width, height) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height
  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = width / height
  let drawWidth
  let drawHeight
  let drawX = x
  let drawY = y

  if (sourceRatio > targetRatio) {
    drawHeight = height
    drawWidth = height * sourceRatio
    drawX = x - (drawWidth - width) / 2
  } else {
    drawWidth = width
    drawHeight = width / sourceRatio
    drawY = y - (drawHeight - height) / 2
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
}

function drawMirroredCover(ctx, image, x, y, width, height) {
  ctx.save()
  ctx.translate(x + width, y)
  ctx.scale(-1, 1)
  drawCover(ctx, image, 0, 0, width, height)
  ctx.restore()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export default function Photo() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const cutoutCanvasRef = useRef(null)
  const segmentationRef = useRef(null)
  const animationRef = useRef(null)
  const isSegmentingRef = useRef(false)
  const lastSegmentAtRef = useRef(0)
  const imageCacheRef = useRef(null)

  const [shotCount, setShotCount] = useState(0)
  const [cameraError, setCameraError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [captures, setCaptures] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    const segmentation = new window.SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    })

    segmentation.setOptions({
      modelSelection: 0,
      selfieMode: true,
    })

    segmentation.onResults((results) => {
      const canvas = cutoutCanvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
        canvas.width = results.image.width
        canvas.height = results.image.height
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-in'
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    })

    segmentationRef.current = segmentation

    return () => {
      segmentation.close()
    }
  }, [])

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 24, max: 30 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setCameraError('카메라 권한을 허용하면 함께 사진을 찍을 수 있어요.')
      }
    }

    startCamera()

    return () => {
      cancelAnimationFrame(animationRef.current)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!cameraReady) return

    async function segmentFrame() {
      const video = videoRef.current
      const segmentation = segmentationRef.current
      const now = performance.now()

      if (
        video &&
        segmentation &&
        video.readyState >= 2 &&
        !isSegmentingRef.current &&
        now - lastSegmentAtRef.current >= SEGMENT_INTERVAL_MS
      ) {
        lastSegmentAtRef.current = now
        isSegmentingRef.current = true
        try {
          await segmentation.send({ image: video })
        } finally {
          isSegmentingRef.current = false
        }
      }

      animationRef.current = requestAnimationFrame(segmentFrame)
    }

    segmentFrame()

    return () => cancelAnimationFrame(animationRef.current)
  }, [cameraReady])

  const capturePhoto = useCallback(async () => {
    if (isCapturing || shotCount >= MAX_SHOTS) return

    setIsCapturing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = CAPTURE_WIDTH
      canvas.height = CAPTURE_HEIGHT

      if (!imageCacheRef.current) {
        imageCacheRef.current = Promise.all([loadImage(backgroundImage), loadImage(idolImage)])
      }

      const [background, idol] = await imageCacheRef.current

      drawCover(ctx, background, 0, 0, canvas.width, canvas.height)

      const cutoutCanvas = cutoutCanvasRef.current
      if (cutoutCanvas?.width && cutoutCanvas?.height) {
        drawMirroredCover(
          ctx,
          cutoutCanvas,
          PERSON_BOX.x * canvas.width,
          PERSON_BOX.y * canvas.height,
          PERSON_BOX.width * canvas.width,
          PERSON_BOX.height * canvas.height,
        )
      }

      drawCover(
        ctx,
        idol,
        IDOL_BOX.x * canvas.width,
        IDOL_BOX.y * canvas.height,
        IDOL_BOX.width * canvas.width,
        IDOL_BOX.height * canvas.height,
      )

      const imageData = canvas.toDataURL('image/jpeg', 0.86)

      setShotCount((count) => Math.min(count + 1, MAX_SHOTS))
      setCaptures((prev) => {
        const nextCaptures = [imageData, ...prev].slice(0, MAX_SHOTS)

        if (nextCaptures.length >= MAX_SHOTS) {
          sessionStorage.setItem(PHOTO_CAPTURE_STORAGE_KEY, JSON.stringify(nextCaptures))
          setTimeout(() => navigate('/photoselect'), 300)
        }

        return nextCaptures
      })
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing, navigate, shotCount])

  useEffect(() => {
    if (!cameraReady || cameraError || isCapturing || countdown !== null || shotCount >= MAX_SHOTS) return

    const timer = setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 0)
    return () => clearTimeout(timer)
  }, [cameraReady, cameraError, isCapturing, countdown, shotCount])

  useEffect(() => {
    if (countdown === null) return

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null)
        capturePhoto()
        return
      }

      setCountdown((value) => value - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, capturePhoto])

  return (
    <main className="photo-page">
      <img className="photo-bg" src={backgroundImage} alt="" />
      <video
        ref={videoRef}
        className="photo-video-source"
        autoPlay
        playsInline
        muted
        onCanPlay={() => setCameraReady(true)}
      />
      <canvas ref={cutoutCanvasRef} className={`photo-camera ${cameraReady ? 'is-ready' : ''}`} />
      <img className="photo-idol" src={idolImage} alt="함께 촬영할 인물" />
      <span className="photo-sparkle" aria-hidden="true" />

      <section className="photo-shot-counter" aria-label={`촬영 횟수 ${shotCount}/${MAX_SHOTS}`}>
        {Array.from({ length: MAX_SHOTS }, (_, index) => (
          <StarIcon key={index} filled={index < shotCount} />
        ))}
      </section>

      {countdown !== null && <div className="photo-countdown" aria-live="assertive">{countdown}</div>}

      {cameraError && (
        <div className="photo-controls">
          <p>{cameraError}</p>
        </div>
      )}

      {captures.length > 0 && (
        <aside className="photo-captures" aria-label="촬영한 사진">
          {captures.slice(0, MAX_SHOTS).map((src, index) => (
            <img src={src} alt={`촬영 결과 ${captures.length - index}`} key={src} />
          ))}
        </aside>
      )}
    </main>
  )
}
