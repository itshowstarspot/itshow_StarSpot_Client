import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import FeedCard from '../components/feed/FeedCard'
import FilterTag from '../components/common/FilterTag'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { fetchFeeds, createFeed } from '../services/feedService'
import { feedSortOptions } from '../domain/feed/feed'

const Page = styled.main`
  min-height: 100vh;
  background: #f5f5f8;
  color: #2d2f36;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45,47,54,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackBtn = styled.button`
  border: none;
  background: transparent;
  color: #e8d664;
  font-size: 20px;
  cursor: pointer;
`

const Title = styled.h1`font-size: 16px; font-weight: 700; color: #2d2f36;`

const Content = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
`

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  background: #f5f5f8;
  border: 1px solid rgba(45,47,54,0.15);
  border-radius: 8px;
  padding: 12px;
  color: #2d2f36;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 12px;
  line-height: 1.5;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.35); }
`

const ImageInput = styled.input`
  width: 100%;
  background: #f5f5f8;
  border: 1px solid rgba(45,47,54,0.15);
  border-radius: 8px;
  padding: 10px 12px;
  color: #2d2f36;
  font-size: 13px;
  outline: none;
  margin-bottom: 12px;
  box-sizing: border-box;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.35); }
`

const ErrorMsg = styled.p`
  font-size: 13px;
  color: #e85050;
`

/**
 * 팬 피드 페이지
 */
export default function Feed() {
  const navigate = useNavigate()
  const [feeds, setFeeds] = useState([])
  const [sort, setSort] = useState('latest')
  const [isLoading, setIsLoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [postError, setPostError] = useState(null)

  const loadFeeds = async () => {
    setIsLoading(true)
    try {
      const data = await fetchFeeds({ sort })
      setFeeds(data)
    } catch {
      /* 에러 무시 */
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadFeeds() }, [sort])

  const handlePost = async () => {
    if (!content.trim()) {
      setPostError('내용을 입력해주세요.')
      return
    }
    setIsPosting(true)
    setPostError(null)
    try {
      const newFeed = await createFeed({ placeId: '', image: imageUrl, content })
      setFeeds((prev) => [newFeed, ...prev])
      setContent('')
      setImageUrl('')
      setShowModal(false)
    } catch (err) {
      setPostError(err.message)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Page>
      <TopBar>
        <TopLeft>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Title>팬 피드</Title>
        </TopLeft>
        <Button size="sm" onClick={() => setShowModal(true)}>+ 글 작성</Button>
      </TopBar>

      <Content>
        <FilterRow>
          {feedSortOptions.map((opt) => (
            <FilterTag
              key={opt.value}
              label={opt.label}
              active={sort === opt.value}
              onClick={() => setSort(opt.value)}
            />
          ))}
        </FilterRow>

        {isLoading && <LoadingSpinner />}
        {!isLoading && feeds.length === 0 && (
          <EmptyState icon="📝" message="아직 피드가 없어요. 첫 번째 후기를 남겨보세요!" />
        )}
        <FeedGrid>
          {feeds.map((f) => (
            <FeedCard
              key={f.id}
              image={f.image}
              placeName={f.placeName}
              content={f.content}
              viewCount={f.viewCount}
              createdAt={f.createdAt}
            />
          ))}
        </FeedGrid>
      </Content>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 style={{ color: '#2d2f36', marginBottom: 16 }}>방문 후기 작성</h2>
        <ImageInput
          placeholder="사진 URL (선택)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Textarea
          placeholder="방문 후기를 작성해주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {postError && <ErrorMsg>{postError}</ErrorMsg>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>취소</Button>
          <Button
            fullWidth
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
          >
            {isPosting ? '등록 중...' : '등록'}
          </Button>
        </div>
      </Modal>
    </Page>
  )
}
