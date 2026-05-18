import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import EmptyState from '../common/EmptyState'
import LoadingSpinner from '../common/LoadingSpinner'
import { useCourse } from '../../hooks/useCourse'
import { usePlaces } from '../../hooks/usePlaces'

/* ─── 공통 레이아웃 ─── */
const Panel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
`

const Header = styled.div`
  flex-shrink: 0;
  padding: 14px 16px 0;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const SectionLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #e8c664;
`

const NewBtn = styled.button`
  height: 28px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1.5px solid #e8d664;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #d4c250; }
`

const BackBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(45,47,54,0.5);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  &:hover { color: #2d2f36; }
`

const Divider = styled.div`
  height: 1px;
  background: rgba(45,47,54,0.08);
  margin: 8px 0 12px;
`

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(45,47,54,0.15); border-radius: 4px; }
`

/* ─── 코스 폴더 카드 ─── */
const FolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.07));
  transition: filter 0.2s;
  &:hover { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.13)); }
`

const FolderTab = styled.div`
  align-self: flex-start;
  background: rgba(232,214,100,0.55);
  border: 1.5px solid #e8d664;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 4px 16px;
  font-size: 10px;
  font-weight: 700;
  color: #7a6a10;
`

const FolderBody = styled.div`
  background: rgba(232,214,100,0.18);
  border: 1.5px solid #e8d664;
  border-radius: 0 8px 8px 8px;
  padding: 14px 14px 12px;
`

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 6px;
`

const CardDesc = styled.div`
  font-size: 12px;
  color: rgba(45,47,54,0.5);
  margin-bottom: 14px;
  line-height: 1.5;
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const DeleteBtn = styled.button`
  height: 26px;
  padding: 0 14px;
  border: 1px solid rgba(45,47,54,0.2);
  border-radius: 7px;
  background: transparent;
  color: rgba(45,47,54,0.5);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #e85050; color: #e85050; }
`

const ViewBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(45,47,54,0.45);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
  &:hover { color: #2d2f36; }
`

/* ─── 코스 생성 ─── */
const TitleInput = styled.input`
  width: 100%;
  height: 40px;
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #2d2f36;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 10px;
  &::placeholder { color: rgba(45,47,54,0.3); }
  &:focus { border-color: #c9b840; }
`

/* 검색바 */
const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  &:focus-within { border-color: #c9b840; }
`

const SearchIcon = styled.div`
  width: 36px;
  height: 36px;
  background: #e8d664;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const SearchInput2 = styled.input`
  flex: 1;
  height: 36px;
  border: none;
  outline: none;
  padding: 0 10px;
  font-size: 12px;
  color: #2d2f36;
  background: #fff;
  &::placeholder { color: #d0d0d0; }
`

const PlacePickerLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(45,47,54,0.5);
  margin-bottom: 6px;
`

const PlacePickList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`

const PlacePickRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid ${({ $checked }) => ($checked ? '#e8d664' : 'rgba(45,47,54,0.1)')};
  background: ${({ $checked }) => ($checked ? 'rgba(232,214,100,0.1)' : '#fff')};
  border-radius: 8px;
  padding: 9px 12px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #e8d664; }
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 15px;
  height: 15px;
  accent-color: #e8d664;
  flex-shrink: 0;
  cursor: pointer;
`

const PlacePickName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #2d2f36;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PlacePickAddr = styled.div`
  font-size: 10px;
  color: rgba(45,47,54,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`

/* 선택된 장소 순서 */
const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`

const OrderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(232,214,100,0.1);
  border: 1px solid rgba(232,214,100,0.3);
  border-radius: 8px;
  padding: 8px 10px;
`

const OrderBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const OrderName = styled.div`
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #2d2f36;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ArrowBtns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const ArrowBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 10px;
  color: rgba(45,47,54,0.35);
  cursor: pointer;
  padding: 1px 3px;
  line-height: 1;
  &:hover { color: #e8b664; }
  &:disabled { opacity: 0.2; cursor: default; }
`

const RemoveBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: rgba(45,47,54,0.25);
  cursor: pointer;
  padding: 0 2px;
  &:hover { color: #e85050; }
`

const ErrorMsg = styled.div`
  font-size: 11px;
  color: #e85050;
  margin-bottom: 8px;
`

const SaveBtn = styled.button`
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #d4c250; }
  &:disabled { background: rgba(232,214,100,0.3); color: rgba(45,47,54,0.3); cursor: default; }
`

export default function CoursePanel({ onCourseOpen, idolId }) {
  const { courses, isLoading, error, loadCourses, removeCourse, submitCourse,
          selectedPlaces, addPlace, removePlace, reorderPlaces } = useCourse()
  const { places } = usePlaces(idolId)

  const [view, setView] = useState('list') // 'list' | 'create'
  const [title, setTitle] = useState('')
  const [localError, setLocalError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadCourses() }, [loadCourses])

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places
    const q = searchQuery.trim().toLowerCase()
    return places.filter(
      (p) => p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
    )
  }, [places, searchQuery])

  const handleSave = async () => {
    if (!title.trim()) { setLocalError('코스 이름을 입력해주세요.'); return }
    if (selectedPlaces.length < 2) { setLocalError('장소를 2개 이상 선택해주세요.'); return }
    const result = await submitCourse({ title: title.trim(), idolId })
    if (result) {
      setTitle('')
      setLocalError('')
      setView('list')
    }
  }

  const handleCancel = () => {
    setTitle('')
    setLocalError('')
    setSearchQuery('')
    setView('list')
  }

  /* ── 목록 화면 ── */
  if (view === 'list') {
    return (
      <Panel>
        <Header>
          <TopRow>
            <SectionLabel>등록한 코스</SectionLabel>
            <NewBtn onClick={() => setView('create')}>+ 새 코스</NewBtn>
          </TopRow>
          <Divider />
        </Header>
        <CardList>
          {isLoading && <LoadingSpinner />}
          {!isLoading && courses.length === 0 && (
            <EmptyState icon="🗺️" message="아직 만든 코스가 없어요." />
          )}
          {courses.map((course) => (
            <FolderWrapper key={course.id}>
              <FolderTab>코스</FolderTab>
              <FolderBody>
                <CardTitle>{course.title || '코스 이름 없음'}</CardTitle>
                <CardDesc>
                  {course.places?.map((p) => p.name).join(' → ') || '장소 없음'}
                </CardDesc>
                <CardFooter>
                  <DeleteBtn onClick={() => removeCourse(course.id)}>삭제</DeleteBtn>
                  <ViewBtn onClick={() => onCourseOpen?.(course)}>열어보기 →</ViewBtn>
                </CardFooter>
              </FolderBody>
            </FolderWrapper>
          ))}
        </CardList>
      </Panel>
    )
  }

  /* ── 코스 생성 화면 ── */
  return (
    <Panel>
      <Header>
        <TopRow>
          <BackBtn onClick={handleCancel}>← 돌아가기</BackBtn>
          <SectionLabel>새 코스 만들기</SectionLabel>
        </TopRow>
        <Divider />
      </Header>

      <CardList>
        {/* 코스 이름 */}
        <TitleInput
          placeholder="코스 이름을 입력하세요"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setLocalError('') }}
        />

        {/* 장소 검색 */}
        <PlacePickerLabel>장소 선택 ({selectedPlaces.length}개 선택됨)</PlacePickerLabel>
        <SearchWrap>
          <SearchIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.4zM11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#ffffff" />
            </svg>
          </SearchIcon>
          <SearchInput2
            placeholder="장소 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background:'transparent', border:'none', padding:'0 8px', color:'rgba(45,47,54,0.3)', cursor:'pointer', fontSize:14 }}
            >✕</button>
          )}
        </SearchWrap>

        {places.length === 0 && (
          <EmptyState icon="📍" message="아이돌을 선택하면 장소가 표시돼요." />
        )}
        {places.length > 0 && filteredPlaces.length === 0 && (
          <EmptyState icon="🔍" message={`"${searchQuery}" 검색 결과가 없어요.`} />
        )}
        <PlacePickList>
          {filteredPlaces.map((place) => {
            const checked = selectedPlaces.some((p) => p.id === place.id)
            return (
              <PlacePickRow key={place.id} $checked={checked}>
                <Checkbox
                  checked={checked}
                  onChange={() => checked ? removePlace(place.id) : addPlace(place)}
                />
                <PlacePickName>{place.name}</PlacePickName>
                <PlacePickAddr>{place.address}</PlacePickAddr>
              </PlacePickRow>
            )
          })}
        </PlacePickList>

        {/* 선택된 장소 순서 */}
        {selectedPlaces.length > 0 && (
          <>
            <PlacePickerLabel>순서 조정</PlacePickerLabel>
            <OrderList>
              {selectedPlaces.map((place, i) => (
                <OrderRow key={place.id}>
                  <OrderBadge>{i + 1}</OrderBadge>
                  <OrderName>{place.name}</OrderName>
                  <ArrowBtns>
                    <ArrowBtn
                      disabled={i === 0}
                      onClick={() => reorderPlaces(i, i - 1)}
                    >▲</ArrowBtn>
                    <ArrowBtn
                      disabled={i === selectedPlaces.length - 1}
                      onClick={() => reorderPlaces(i, i + 1)}
                    >▼</ArrowBtn>
                  </ArrowBtns>
                  <RemoveBtn onClick={() => removePlace(place.id)}>✕</RemoveBtn>
                </OrderRow>
              ))}
            </OrderList>
          </>
        )}

        {(localError || error) && <ErrorMsg>{localError || error}</ErrorMsg>}

        <SaveBtn
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '코스 저장'}
        </SaveBtn>
      </CardList>
    </Panel>
  )
}
