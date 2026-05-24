import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PhotoSelect.css'
import MapView from '../components/layout/MapView'
import PlaceDetailModal from '../components/place/PlaceDetailModal'
import Sidebar from '../components/sidebar/Sidebar'
import SearchPanel from '../components/sidebar/SearchPanel'
import RoutePanel from '../components/sidebar/RoutePanel'
import CoursePanel from '../components/sidebar/CoursePanel'
import FavoritesPanel from '../components/sidebar/FavoritesPanel'
import { usePlaces } from '../hooks/usePlaces'
import { createFeed } from '../services/feedService'

const PHOTO_CAPTURE_STORAGE_KEY = 'starspot.photoCaptures'
const LATEST_POST_KEY = 'starspot.latestPost'

const thumbnailPhotos = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=90',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1200&q=90',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=90',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=90',
  },
]

const feedPlaceholder = '여기에 하고 싶은 말을 입력해주세요..'

const readCapturedPhotos = () => {
  try {
    const savedCaptures = JSON.parse(sessionStorage.getItem(PHOTO_CAPTURE_STORAGE_KEY) || '[]')

    if (!Array.isArray(savedCaptures)) return []

    return savedCaptures
      .filter((src) => typeof src === 'string' && src.startsWith('data:image/'))
      .map((src, index) => ({
        id: `capture-${index + 1}`,
        src,
      }))
  } catch {
    return []
  }
}

const formatToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${date}`
}

function StarIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="m20 4.6 4.5 9.1 10.1 1.5-7.3 7.1 1.7 10-9-4.8-9 4.8 1.7-10-7.3-7.1 10.1-1.5L20 4.6Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="m8.6 7.2 12 12 11.9-12 1.4 1.4-12 12 12 11.9-1.4 1.4-11.9-12-12 12-1.4-1.4 12-11.9-12-12 1.4-1.4Z" />
    </svg>
  )
}

function ActivePanel({ navId, selectedIdol, onPlaceClick }) {
  switch (navId) {
    case 'route': return <RoutePanel />
    case 'favorite': return <FavoritesPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
    case 'course': return <CoursePanel idolId={selectedIdol?.id} />
    default: return <SearchPanel idolId={selectedIdol?.id} onPlaceClick={onPlaceClick} />
  }
}

export default function PhtoSelect({ selectedIdol }) {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('search')
  const [capturedPhotos] = useState(readCapturedPhotos)
  const [selectedId, setSelectedId] = useState(null)
  const [today] = useState(formatToday)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [content, setContent] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { filteredPlaces } = usePlaces(selectedIdol?.id)
  const photos = capturedPhotos.length > 0 ? capturedPhotos : thumbnailPhotos
  const selectedPhoto = photos.find((item) => item.id === selectedId) ?? photos[0]

  const handleSubmit = async () => {
    if (!content.trim()) {
      setSubmitError('글 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const post = {
        image: selectedPhoto.src,
        title: content.trim(),
        date: today,
      }

      await createFeed({
        placeId: selectedPlaceId || '',
        image: post.image,
        content: post.title,
      })
      sessionStorage.setItem(LATEST_POST_KEY, JSON.stringify(post))
      sessionStorage.removeItem(PHOTO_CAPTURE_STORAGE_KEY)
      navigate('/postregister', { state: { post } })
    } catch (error) {
      setSubmitError(error.message || '등록에 실패했어요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="photo-select-page">
      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        idolImage={selectedIdol?.profile}
        panelOpen={false}
      >
        <ActivePanel
          navId={activeNav}
          selectedIdol={selectedIdol}
          onPlaceClick={(id) => setSelectedPlaceId(id)}
        />
      </Sidebar>

      <section className="photo-map-area" aria-label="지도">
        <MapView places={filteredPlaces} onPlaceClick={(id) => setSelectedPlaceId(id)} />

        {selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}

        <section className={`photo-modal ${isModalOpen ? '' : 'is-hidden'}`} role="dialog" aria-modal="true" aria-label="사진 선택">
          <button className="photo-modal-close" type="button" aria-label="닫기" onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </button>

          <div className="photo-thumb-column">
            {photos.map((item) => (
              <button
                className={`photo-thumb ${selectedPhoto.id === item.id ? 'selected' : ''}`}
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <img src={item.src} alt={`사진 ${item.id}`} />
                <StarIcon />
              </button>
            ))}
          </div>

          <div className="photo-editor-card">
            <img src={selectedPhoto.src} alt="선택된 사진" />
            <p>{today}</p>
            <textarea
              aria-label="피드 내용"
              placeholder={feedPlaceholder}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            {submitError && <strong className="photo-submit-error">{submitError}</strong>}
          </div>

          <button
            className="photo-submit-button"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중' : '등록'}
          </button>
        </section>
      </section>
    </main>
  )
}
