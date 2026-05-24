import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './PostRegister.css'
import MapView from '../components/layout/MapView'
import Sidebar from '../components/sidebar/Sidebar'
import SearchPanel from '../components/sidebar/SearchPanel'
import RoutePanel from '../components/sidebar/RoutePanel'
import CoursePanel from '../components/sidebar/CoursePanel'
import FavoritesPanel from '../components/sidebar/FavoritesPanel'
import PlaceDetailModal from '../components/place/PlaceDetailModal'
import { usePlaces } from '../hooks/usePlaces'

const LATEST_POST_KEY = 'starspot.latestPost'

const dummyPosts = [
  {
    id: 'dummy-1',
    date: '2026-04-28',
    title: '버블에서만 보던 곳! 직접 와보니 좋았어!',
  },
  {
    id: 'dummy-2',
    date: '2026-04-28',
    title: '최애랑 빵계로 빵이 너무 맛있어서 단골될듯',
  },
  {
    id: 'dummy-3',
    date: '2026-04-28',
    title: 'OOI 때문에 돼지가 될 것 같아 ㅋㅋㅋ',
  },
  {
    id: 'dummy-4',
    date: '2026-04-28',
    title: '멀어서 힘들었지만 꽤나 만족!',
  },
  {
    id: 'dummy-5',
    date: '2026-04-28',
    title: '별다섯개 드리고 저는 다른 곳을 찾아 총총..',
  },
]

const readLatestPost = () => {
  try {
    const savedPost = JSON.parse(sessionStorage.getItem(LATEST_POST_KEY) || 'null')
    if (!savedPost?.title || !savedPost?.image) return null
    return savedPost
  } catch {
    return null
  }
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="m8.6 7.2 12 12 11.9-12 1.4 1.4-12 12 12 11.9-1.4 1.4-11.9-12-12 12-1.4-1.4 12-11.9-12-12 1.4-1.4Z" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M17.3 9.1 6.4 20l10.9 10.9 1.4-1.4-8.5-8.5h23.4v-2H10.2l8.5-8.5-1.4-1.4Z" />
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

export default function PostRegister({ selectedIdol, onReturnHome }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeNav, setActiveNav] = useState('search')
  const [postQuery, setPostQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [latestPost] = useState(() => location.state?.post || readLatestPost())
  const { filteredPlaces } = usePlaces(selectedIdol?.id)

  const posts = useMemo(() => {
    const primaryPost = latestPost
      ? {
          id: 'latest',
          image: latestPost.image,
          date: latestPost.date,
          title: latestPost.title,
        }
      : null

    return primaryPost ? [primaryPost, ...dummyPosts] : dummyPosts
  }, [latestPost])

  const filteredPosts = useMemo(() => {
    const keyword = postQuery.trim().toLowerCase()
    if (!keyword) return posts

    return posts.filter((post) => post.title.toLowerCase().includes(keyword))
  }, [posts, postQuery])

  return (
    <main className="post-register-page">
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

      <section className="post-register-map">
        <MapView places={filteredPlaces} onPlaceClick={(id) => setSelectedPlaceId(id)} />
        <div className="post-register-map-dim" />

        {selectedPlaceId && (
          <PlaceDetailModal
            placeId={selectedPlaceId}
            onClose={() => setSelectedPlaceId(null)}
          />
        )}

        <section className="post-register-modal" aria-label="등록된 게시물">
          <button
            className="post-register-close"
            type="button"
            aria-label="닫기"
            onClick={() => {
              onReturnHome?.()
              navigate('/home')
            }}
          >
            <CloseIcon />
          </button>

          {selectedPost ? (
            <div className="post-register-detail">
              <button className="post-register-back" type="button" aria-label="목록으로 돌아가기" onClick={() => setSelectedPost(null)}>
                <BackIcon />
              </button>

              <article className="post-register-detail-card">
                {selectedPost.image ? <img src={selectedPost.image} alt="" /> : <div className="post-register-detail-placeholder" />}
                <time>{selectedPost.date}</time>
                <strong>{selectedPost.title}</strong>
              </article>
            </div>
          ) : (
            <>
              <input
                className="post-register-modal-search"
                value={postQuery}
                onChange={(event) => setPostQuery(event.target.value)}
                aria-label="게시물 검색"
              />

              <div className="post-register-grid">
                {filteredPosts.map((post) => (
                  <button className="post-register-post-card" type="button" key={post.id} onClick={() => setSelectedPost(post)}>
                    {post.image ? <img src={post.image} alt="" /> : <div className="post-register-placeholder" />}
                    <time>{post.date}</time>
                    <strong>{post.title}</strong>
                  </button>
                ))}
              </div>

              <button
                className="post-register-add"
                type="button"
                aria-label="게시물 추가"
                onClick={() => navigate('/photo')}
              >
                +
              </button>
            </>
          )}
        </section>

        <div className="post-register-map-actions">
          <button type="button">+</button>
          <button type="button">☆</button>
        </div>
      </section>
    </main>
  )
}
