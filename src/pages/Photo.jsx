import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Photo.css";
import { saveCapturedPhotos } from "../utils/photoStorage";
import { getPhotoFrameSrc } from "../utils/photoFrames";
import { SESSION_KEY_REVIEW_PLACE } from "../constants/storageKeys";

const MAX_SHOTS = 5;
const COUNTDOWN_SECONDS = 5;
const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;
const FRAME_BOX_WIDTH = 1032;
const FRAME_BOX_HEIGHT = 1080;
const FRAME_RIGHT_OFFSET = 90;
const KARINA_ONE_FRAME_LEFT_OFFSET = 30;
const KARINA_WIDE_FRAME_SCALE = 1;
const JEEMIN_FRAME_SCALE = 0.9;
const JEEMIN_SMALL_FRAME_SCALE = 0.8;
const JEEMIN_FRAME_LEFT_OFFSET = 70;
const JEEMIN_ONE_EXTRA_LEFT_OFFSET = 30;
const YOUNGJI_FRAME_LEFT_OFFSET = 50;
const JUNGKOOK_FRAME_LEFT_OFFSET = 100;
const YOUNGK_FRAME_LEFT_OFFSET = 50;
const YOUNGK_FRAME_SCALE = 1;

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={filled ? "filled" : ""}
    >
      <path d="M32 4.8 39.8 22l18.7 2.1-13.9 12.7 3.8 18.4L32 45.8 15.6 55.2l3.8-18.4L5.5 24.1 24.2 22 32 4.8Z" />
    </svg>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getFrameAdjustment(frameSrc) {
  if (frameSrc?.includes("frame_karina_1")) {
    return {
      scale: 1,
      xOffset: -KARINA_ONE_FRAME_LEFT_OFFSET,
    };
  }

  if (frameSrc?.includes("frame_youngk_")) {
    return {
      scale: YOUNGK_FRAME_SCALE,
      xOffset: -YOUNGK_FRAME_LEFT_OFFSET,
    };
  }

  if (frameSrc?.includes("frame_jungkook_")) {
    return {
      scale: 1,
      xOffset: -JUNGKOOK_FRAME_LEFT_OFFSET,
    };
  }

  if (
    frameSrc?.includes("frame_youngji_1") ||
    frameSrc?.includes("frame_youngji_2")
  ) {
    return {
      scale: 1,
      xOffset: -YOUNGJI_FRAME_LEFT_OFFSET,
    };
  }

  if (
    frameSrc?.includes("frame_jeemin_1") ||
    frameSrc?.includes("frame_jeemin_3")
  ) {
    return {
      scale: JEEMIN_SMALL_FRAME_SCALE,
      xOffset: -(
        JEEMIN_FRAME_LEFT_OFFSET +
        (frameSrc.includes("frame_jeemin_1") ? JEEMIN_ONE_EXTRA_LEFT_OFFSET : 0)
      ),
    };
  }

  if (frameSrc?.includes("frame_jeemin_")) {
    return {
      scale: JEEMIN_FRAME_SCALE,
      xOffset: -JEEMIN_FRAME_LEFT_OFFSET,
    };
  }

  return { scale: 1, xOffset: 0 };
}

function drawFrameOverlay(ctx, frameImg, frameSrc) {
  if (
    frameSrc?.includes("frame_karina_2") ||
    frameSrc?.includes("frame_karina_3")
  ) {
    const height = OUTPUT_HEIGHT * KARINA_WIDE_FRAME_SCALE;
    const width = height * (frameImg.naturalWidth / frameImg.naturalHeight);
    const x = OUTPUT_WIDTH - width + FRAME_RIGHT_OFFSET;
    const y = OUTPUT_HEIGHT - height;

    ctx.drawImage(frameImg, x, y, width, height);
    return;
  }

  const sourceWidth = frameImg.naturalWidth;
  const sourceHeight = frameImg.naturalHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = FRAME_BOX_WIDTH / FRAME_BOX_HEIGHT;
  const { scale, xOffset } = getFrameAdjustment(frameSrc);

  let drawWidth = FRAME_BOX_WIDTH;
  let drawHeight = FRAME_BOX_HEIGHT;

  if (sourceRatio > targetRatio) {
    drawHeight = FRAME_BOX_WIDTH / sourceRatio;
  } else {
    drawWidth = FRAME_BOX_HEIGHT * sourceRatio;
  }

  drawWidth *= scale;
  drawHeight *= scale;

  const boxX = OUTPUT_WIDTH - FRAME_BOX_WIDTH + FRAME_RIGHT_OFFSET + xOffset;
  const boxY = OUTPUT_HEIGHT - FRAME_BOX_HEIGHT;
  const drawX = boxX + FRAME_BOX_WIDTH - drawWidth;
  const drawY = boxY + FRAME_BOX_HEIGHT - drawHeight;

  ctx.drawImage(frameImg, drawX, drawY, drawWidth, drawHeight);
}

export default function Photo({ selectedIdol }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const previewCanvasRef = useRef(null); // 화면에 보이는 캔버스 (카메라 미리보기)
  const animationRef = useRef(null);
  const frameImgRef = useRef(null);
  const capturesRef = useRef([]);
  const isCapturingRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [shotCount, setShotCount] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [loadedFrameSrc, setLoadedFrameSrc] = useState(null);
  const [reviewPlaceId] = useState(() =>
    sessionStorage.getItem(SESSION_KEY_REVIEW_PLACE),
  );
  const frameSrc = useMemo(
    () =>
      getPhotoFrameSrc({ idolId: selectedIdol?.id, placeId: reviewPlaceId }),
    [selectedIdol?.id, reviewPlaceId],
  );
  const isFrameReady = !frameSrc || loadedFrameSrc === frameSrc;

  // 프레임 미리 로드
  useEffect(() => {
    frameImgRef.current = null;
    if (!frameSrc) return;

    loadImage(frameSrc)
      .then((img) => {
        frameImgRef.current = img;
        setLoadedFrameSrc(frameSrc);
      })
      .catch(() => {
        frameImgRef.current = null;
        setLoadedFrameSrc(frameSrc);
      });
  }, [frameSrc]);

  // 카메라 시작
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 24, max: 30 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError("카메라 권한을 허용하면 함께 사진을 찍을 수 있어요.");
      }
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // 카메라 영상 → 캔버스 미러 렌더링 루프 (배경제거 없이 그대로)
  useEffect(() => {
    if (!cameraReady) return;

    function renderFrame() {
      const video = videoRef.current;
      const canvas = previewCanvasRef.current;
      if (!canvas || !video || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth || 960;
        canvas.height = video.videoHeight || 540;
      }

      // 좌우 반전 (셀카 모드)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      animationRef.current = requestAnimationFrame(renderFrame);
    }

    renderFrame();
    return () => cancelAnimationFrame(animationRef.current);
  }, [cameraReady]);

  // 사진 촬영 — 카메라 영상 + 프레임만
  const capturePhoto = useCallback(() => {
    if (isCapturingRef.current || capturesRef.current.length >= MAX_SHOTS)
      return;
    isCapturingRef.current = true;

    try {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const ctx = canvas.getContext("2d");

      // 카메라 (미러 반전 해제)
      ctx.save();
      ctx.translate(OUTPUT_WIDTH, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      ctx.restore();

      // 프레임 오버레이
      if (frameImgRef.current) {
        drawFrameOverlay(ctx, frameImgRef.current, frameSrc);
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.88);
      const nextCaptures = [imageData, ...capturesRef.current].slice(
        0,
        MAX_SHOTS,
      );

      capturesRef.current = nextCaptures;
      setCaptures(nextCaptures);
      setShotCount(nextCaptures.length);

      if (nextCaptures.length >= MAX_SHOTS) {
        saveCapturedPhotos(nextCaptures);
        setTimeout(
          () => navigate("/photoselect", { state: { spotId: reviewPlaceId } }),
          300,
        ); // ✨ 다음 화면으로 spotId 토스!
      }
    } finally {
      isCapturingRef.current = false;
    }
  }, [frameSrc, navigate]);

  // 카운트다운 시작
  useEffect(() => {
    if (
      !cameraReady ||
      !isFrameReady ||
      cameraError ||
      countdown !== null ||
      shotCount >= MAX_SHOTS
    )
      return;
    const timer = setTimeout(() => setCountdown(COUNTDOWN_SECONDS), 800);
    return () => clearTimeout(timer);
  }, [cameraReady, isFrameReady, cameraError, countdown, shotCount]);

  // 카운트다운 tick
  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown((v) => v - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto]);

  return (
    <main className="photo-page">
      {/* 숨겨진 video (스트림 소스) */}
      <video
        ref={videoRef}
        className="photo-video-source"
        autoPlay
        playsInline
        muted
        onCanPlay={() => setCameraReady(true)}
      />

      {/* 카메라 미리보기 캔버스 — 전체화면 */}
      <div className="photo-stage">
        <canvas
          ref={previewCanvasRef}
          className={`photo-camera ${cameraReady ? "is-ready" : ""}`}
        />

        {/* 프레임 오버레이 */}
        {frameSrc && (
          <img
            className={[
              "photo-frame-overlay",
              frameSrc.includes("frame_jeemin_") ? "is-jeemin" : "",
              frameSrc.includes("frame_jeemin_1") ||
              frameSrc.includes("frame_jeemin_3")
                ? "is-jeemin-small"
                : "",
              frameSrc.includes("frame_jeemin_1") ? "is-jeemin-one" : "",
              frameSrc.includes("frame_youngji_1") ||
              frameSrc.includes("frame_youngji_2")
                ? "is-youngji-shift"
                : "",
              frameSrc.includes("frame_jungkook_") ? "is-jungkook-shift" : "",
              frameSrc.includes("frame_youngk_") ? "is-youngk-shift" : "",
              frameSrc.includes("frame_karina_1") ? "is-karina-one" : "",
              frameSrc.includes("frame_karina_2") ||
              frameSrc.includes("frame_karina_3")
                ? "is-karina-wide"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            src={frameSrc}
            alt=""
          />
        )}
      </div>

      <section
        className="photo-shot-counter"
        aria-label={`촬영 횟수 ${shotCount}/${MAX_SHOTS}`}
      >
        {Array.from({ length: MAX_SHOTS }, (_, i) => (
          <StarIcon key={i} filled={i < shotCount} />
        ))}
      </section>

      {countdown !== null && (
        <div className="photo-countdown" aria-live="assertive">
          {countdown}
        </div>
      )}

      {cameraError && (
        <div className="photo-controls">
          <p>{cameraError}</p>
        </div>
      )}

      {captures.length > 0 && (
        <aside className="photo-captures" aria-label="촬영한 사진">
          {captures.slice(0, MAX_SHOTS).map((src, i) => (
            <img src={src} alt={`촬영 결과 ${captures.length - i}`} key={src} />
          ))}
        </aside>
      )}
    </main>
  );
}
