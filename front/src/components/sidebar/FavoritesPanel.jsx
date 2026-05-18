import { useState, useEffect } from 'react'
import styled from 'styled-components'
import EmptyState from '../common/EmptyState'
import { useFavorites } from '../../hooks/useFavorites'
import { usePlaces } from '../../hooks/usePlaces'
import { fetchVisits, createVisit, deleteVisit } from '../../services/visitService'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
`

const PanelHeader = styled.div`
  flex-shrink: 0;
  padding: 14px 16px 0;
`

const SearchBarWrap = styled.div`
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid #e8d664;
  margin-bottom: 10px;
  &:focus-within { border-color: #c9b840; }
`

const SearchIconBox = styled.div`
  width: 41px;
  height: 41px;
  background: #e8d664;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const SearchInput = styled.input`
  flex: 1;
  height: 41px;
  background: #ffffff;
  border: none;
  outline: none;
  color: #2d2f36;
  font-size: 12px;
  padding: 0 12px;
  &::placeholder { color: #d0d0d0; }
`

const FilterRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
`

const FilterChip = styled.button`
  height: 26px;
  padding: 0 14px;
  border-radius: 13px;
  border: 1.5px solid ${({ $active }) => ($active ? '#e8d664' : 'rgba(45,47,54,0.15)')};
  background: ${({ $active }) => ($active ? '#e8d664' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1a1a1a' : 'rgba(45,47,54,0.5)')};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #e8d664; }
`

const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #e8c664;
  margin-bottom: 8px;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(45, 47, 54, 0.08);
  margin: 0 0 12px;
`

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(45,47,54,0.15); border-radius: 4px; }
`

/* 즐겨찾기 카드 — PlaceCard 스타일 기반 */
const FavCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.2s, transform 0.2s;
  flex-shrink: 0;
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.13);
    transform: translateY(-2px);
  }
`

const FavImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #d9d9d9;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`

const FavBody = styled.div`
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FavDesc = styled.p`
  font-size: 12px;
  color: rgba(45, 47, 54, 0.55);
  margin: 0;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const FavFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const FavName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #e8b664;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StarBtn = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #e8d664;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.15s;
  &:hover { transform: scale(1.2); }
`

/* 방문 기록 카드 */
const VisitCard = styled.div`
  background: #ffffff;
  border: 1px solid rgba(45, 47, 54, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const VisitInfo = styled.div`
  flex: 1;
`

const VisitName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #e8b664;
  margin-bottom: 2px;
`

const VisitMeta = styled.div`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.45);
`

const DelBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(45, 47, 54, 0.15);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 11px;
  color: rgba(45, 47, 54, 0.45);
  cursor: pointer;
  flex-shrink: 0;
  &:hover { border-color: #e85050; color: #e85050; }
`

/* 방문 기록 추가 폼 */
const AddForm = styled.div`
  background: rgba(232, 214, 100, 0.08);
  border: 1.5px dashed rgba(232, 214, 100, 0.4);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FormInput = styled.input`
  width: 100%;
  height: 34px;
  border: 1px solid rgba(45, 47, 54, 0.12);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 12px;
  color: #2d2f36;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: #e8d664; }
  &::placeholder { color: rgba(45,47,54,0.3); }
`

const AddBtn = styled.button`
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #d4c250; }
`

const TextBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 12px;
  color: #e8c664;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
`

const FILTERS = ['관련도순', '거리순', '전체선택']

export default function FavoritesPanel({ idolId, onPlaceClick }) {
  const [filter, setFilter] = useState('관련도순')
  const [query, setQuery] = useState('')
  const { favorites, toggleFavorite } = useFavorites()
  const { places } = usePlaces(idolId)

  const [visits, setVisits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formMemo, setFormMemo] = useState('')

  useEffect(() => {
    fetchVisits().then(setVisits)
  }, [])

  const favPlaces = filter === '전체선택'
    ? places
    : places.filter((p) => favorites.includes(p.id))

  const displayed = query
    ? favPlaces.filter((p) => p.name.includes(query) || p.description?.includes(query))
    : favPlaces

  const handleAddVisit = async () => {
    if (!formName.trim() || !formDate) return
    const v = await createVisit({ placeName: formName, date: formDate, memo: formMemo })
    setVisits((prev) => [v, ...prev])
    setFormName(''); setFormDate(''); setFormMemo(''); setShowForm(false)
  }

  const handleDeleteVisit = async (id) => {
    await deleteVisit(id)
    setVisits((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <Panel>
      <PanelHeader>
        <SearchBarWrap>
          <SearchIconBox>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.4zM11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#ffffff" />
            </svg>
          </SearchIconBox>
          <SearchInput
            placeholder="즐겨찾기를 검색하세요.."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchBarWrap>

        <FilterRow>
          {FILTERS.map((f) => (
            <FilterChip key={f} $active={filter === f} onClick={() => setFilter(f)}>{f}</FilterChip>
          ))}
        </FilterRow>

        <SectionLabel>즐겨찾기 목록</SectionLabel>
        <Divider />
      </PanelHeader>

      <CardList>
        {/* 즐겨찾기 목록 */}
        {displayed.length === 0 && (
          <EmptyState icon="⭐" message="즐겨찾기한 장소가 없어요." />
        )}
        {displayed.map((place) => (
          <FavCard key={place.id} onClick={() => onPlaceClick?.(place.id)}>
            <FavImage>
              {place.image && <img src={place.image} alt={place.name} loading="lazy" />}
            </FavImage>
            <FavBody>
              <FavDesc>{place.description || place.address}</FavDesc>
              <FavFooter>
                <FavName>{place.name}</FavName>
                <StarBtn onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id) }}>
                  {favorites.includes(place.id) ? '★' : '☆'}
                </StarBtn>
              </FavFooter>
            </FavBody>
          </FavCard>
        ))}

        {/* 방문 기록 구분선 */}
        <div style={{ marginTop: 8 }}>
          <SectionLabel>방문 기록</SectionLabel>
          <Divider />
        </div>

        {/* 방문 기록 추가 버튼/폼 */}
        {!showForm && (
          <TextBtn onClick={() => setShowForm(true)}>+ 방문 기록 추가</TextBtn>
        )}
        {showForm && (
          <AddForm>
            <FormInput placeholder="장소 이름" value={formName} onChange={(e) => setFormName(e.target.value)} />
            <FormInput type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            <FormInput placeholder="메모 (선택)" value={formMemo} onChange={(e) => setFormMemo(e.target.value)} />
            <div style={{ display: 'flex', gap: 6 }}>
              <AddBtn style={{ flex: 1 }} onClick={handleAddVisit}>저장</AddBtn>
              <AddBtn style={{ flex: 1, background: 'transparent', border: '1px solid rgba(45,47,54,0.15)', color: 'rgba(45,47,54,0.5)' }} onClick={() => setShowForm(false)}>취소</AddBtn>
            </div>
          </AddForm>
        )}

        {/* 방문 기록 목록 */}
        {visits.length === 0 && !showForm && (
          <EmptyState icon="📍" message="방문 기록이 없어요." />
        )}
        {visits.map((v) => (
          <VisitCard key={v.id}>
            <VisitInfo>
              <VisitName>{v.placeName}</VisitName>
              <VisitMeta>{v.date}{v.memo ? ` · ${v.memo}` : ''}</VisitMeta>
            </VisitInfo>
            <DelBtn onClick={() => handleDeleteVisit(v.id)}>삭제</DelBtn>
          </VisitCard>
        ))}
      </CardList>
    </Panel>
  )
}
