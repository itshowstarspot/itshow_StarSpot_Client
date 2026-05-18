import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import IdolSelectModal from '../components/IdolSelectModal'
import { fetchVisits, createVisit, updateVisit, deleteVisit } from '../services/visitService'
import { idols } from '../domain/idol/idol'

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
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const VisitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const VisitCard = styled.div`
  background: #ffffff;
  border: 1px solid rgba(45,47,54,0.08);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
`

const VisitPhoto = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #d9d9d9;
  flex-shrink: 0;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`

const VisitInfo = styled.div`
  flex: 1;
`

const VisitName = styled.span`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d2f36;
`

const VisitDate = styled.span`
  display: block;
  font-size: 12px;
  color: rgba(45,47,54,0.45);
  margin-top: 2px;
`

const VisitMemo = styled.span`
  display: block;
  font-size: 12px;
  color: rgba(45,47,54,0.6);
  margin-top: 4px;
`

const CardActions = styled.div`
  display: flex;
  gap: 6px;
`

const FormInput = styled.input`
  width: 100%;
  background: #f5f5f8;
  border: 1px solid rgba(45,47,54,0.15);
  border-radius: 8px;
  padding: 10px 14px;
  color: #2d2f36;
  font-size: 14px;
  outline: none;
  margin-bottom: 10px;
  box-sizing: border-box;

  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.35); }
`

const ErrorMsg = styled.p`font-size: 13px; color: #e85050;`

const IdolSection = styled.div`
  background: rgba(232,214,100,0.1);
  border: 1.5px solid rgba(232,214,100,0.4);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const IdolInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }
`

const IdolLabel = styled.span`
  font-size: 14px;
  color: #b8962a;
  font-weight: 600;
`

/**
 * 방문 기록 관리 페이지
 */
export default function VisitHistory({ selectedIdol, onIdolChange }) {
  const navigate = useNavigate()
  const [visits, setVisits] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showIdolModal, setShowIdolModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // 폼 상태
  const [formPlaceName, setFormPlaceName] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formMemo, setFormMemo] = useState('')
  const [formError, setFormError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadVisits = async () => {
    setIsLoading(true)
    try {
      const data = await fetchVisits()
      setVisits(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadVisits() }, [])

  const openEdit = (visit) => {
    setEditTarget(visit)
    setFormPlaceName(visit.placeName)
    setFormDate(visit.date)
    setFormMemo(visit.memo || '')
    setFormError(null)
    setShowAddModal(true)
  }

  const openAdd = () => {
    setEditTarget(null)
    setFormPlaceName('')
    setFormDate('')
    setFormMemo('')
    setFormError(null)
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!formDate) {
      setFormError('방문 날짜를 입력해주세요.')
      return
    }
    if (!formPlaceName.trim()) {
      setFormError('장소 이름을 입력해주세요.')
      return
    }
    setIsSaving(true)
    setFormError(null)
    try {
      if (editTarget) {
        const updated = await updateVisit(editTarget.id, { placeName: formPlaceName, date: formDate, memo: formMemo })
        setVisits((prev) => prev.map((v) => v.id === updated.id ? updated : v))
      } else {
        const newVisit = await createVisit({ placeId: '', placeName: formPlaceName, date: formDate, memo: formMemo })
        setVisits((prev) => [newVisit, ...prev])
      }
      setShowAddModal(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (visitId) => {
    await deleteVisit(visitId)
    setVisits((prev) => prev.filter((v) => v.id !== visitId))
    setShowDeleteConfirm(null)
  }

  return (
    <Page>
      <TopBar>
        <TopLeft>
          <BackBtn onClick={() => navigate(-1)}>←</BackBtn>
          <Title>방문 기록 관리</Title>
        </TopLeft>
        <Button size="sm" onClick={openAdd}>+ 기록 추가</Button>
      </TopBar>

      <Content>
        {/* 최애 아이돌 설정 */}
        <div>
          <SectionTitle>⭐ 내 최애 아이돌</SectionTitle>
          <IdolSection>
            {selectedIdol ? (
              <IdolInfo>
                <img src={selectedIdol.image} alt={selectedIdol.name} />
                <IdolLabel>{selectedIdol.groupLabel} {selectedIdol.name}</IdolLabel>
              </IdolInfo>
            ) : (
              <IdolLabel style={{ color: 'rgba(45,47,54,0.45)' }}>선택된 아이돌 없음</IdolLabel>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowIdolModal(true)}>
              {selectedIdol ? '변경' : '선택'}
            </Button>
          </IdolSection>
        </div>

        {/* 방문 기록 */}
        <div>
          <SectionTitle>🗓 방문 기록</SectionTitle>
          {isLoading && <LoadingSpinner />}
          {!isLoading && visits.length === 0 && (
            <EmptyState icon="📍" message="방문 기록이 없어요. 첫 방문 기록을 추가해보세요!" />
          )}
          <VisitList>
            {visits.map((visit) => (
              <VisitCard key={visit.id}>
                <VisitPhoto>
                  {visit.photo && <img src={visit.photo} alt={visit.placeName} />}
                </VisitPhoto>
                <VisitInfo>
                  <VisitName>{visit.placeName}</VisitName>
                  <VisitDate>{visit.date}</VisitDate>
                  {visit.memo && <VisitMemo>{visit.memo}</VisitMemo>}
                </VisitInfo>
                <CardActions>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(visit)}>수정</Button>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(visit.id)}>삭제</Button>
                </CardActions>
              </VisitCard>
            ))}
          </VisitList>
        </div>
      </Content>

      {/* 추가/수정 모달 */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 style={{ color: '#2d2f36', marginBottom: 16 }}>
          {editTarget ? '방문 기록 수정' : '방문 기록 추가'}
        </h2>
        <FormInput
          placeholder="장소 이름"
          value={formPlaceName}
          onChange={(e) => setFormPlaceName(e.target.value)}
        />
        <FormInput
          type="date"
          value={formDate}
          onChange={(e) => setFormDate(e.target.value)}
          style={{ colorScheme: 'dark' }}
        />
        <FormInput
          placeholder="메모 (선택)"
          value={formMemo}
          onChange={(e) => setFormMemo(e.target.value)}
        />
        {formError && <ErrorMsg>{formError}</ErrorMsg>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>취소</Button>
          <Button fullWidth onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)}>
        <h2 style={{ color: '#2d2f36', marginBottom: 12 }}>삭제 확인</h2>
        <p style={{ color: 'rgba(45,47,54,0.6)', marginBottom: 20 }}>
          이 방문 기록을 삭제할까요? 되돌릴 수 없어요.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(null)}>취소</Button>
          <Button variant="danger" fullWidth onClick={() => handleDelete(showDeleteConfirm)}>삭제</Button>
        </div>
      </Modal>

      {/* 아이돌 변경 모달 */}
      <IdolSelectModal
        isOpen={showIdolModal}
        idols={idols}
        onSelect={(idol) => { onIdolChange(idol); setShowIdolModal(false) }}
      />
    </Page>
  )
}
