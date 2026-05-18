import { useState } from 'react'
import styled from 'styled-components'
import PlaceCard from '../common/PlaceCard'
import EmptyState from '../common/EmptyState'
import LoadingSpinner from '../common/LoadingSpinner'
import { usePlaces } from '../../hooks/usePlaces'

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

/* 검색창 */
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

/* 정렬 칩 */
const SortRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
`

const SortChip = styled.button`
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

const SectionLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #e8c664;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(45, 47, 54, 0.08);
  margin: 8px 0 12px;
`

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(45,47,54,0.15);
    border-radius: 4px;
  }
`

export default function SearchPanel({ idolId, onPlaceClick }) {
  const [sort, setSort] = useState('관련도순')
  const [inputValue, setInputValue] = useState('')

  const { filteredPlaces, isLoading, error, setQuery, search } = usePlaces(idolId)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setQuery(inputValue)
      search(inputValue)
    }
  }

  const handleChange = (e) => {
    setInputValue(e.target.value)
    if (!e.target.value) setQuery('')
  }

  const sectionLabel = sort === '거리순' ? '최단 거리' : '검색 관련 결과'

  return (
    <Panel>
      <PanelHeader>
        <SearchBarWrap>
          <SearchIconBox>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42-1.4zM11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
                fill="#ffffff"
              />
            </svg>
          </SearchIconBox>
          <SearchInput
            type="text"
            placeholder="가고 싶은 장소를 입력하세요.."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </SearchBarWrap>

        <SortRow>
          <SortChip $active={sort === '관련도순'} onClick={() => setSort('관련도순')}>관련도순</SortChip>
          <SortChip $active={sort === '거리순'} onClick={() => setSort('거리순')}>거리순</SortChip>
        </SortRow>

        <SectionLabel>{sectionLabel}</SectionLabel>
        <Divider />
      </PanelHeader>

      <CardList>
        {isLoading && <LoadingSpinner />}
        {error && <EmptyState icon="⚠️" message={error} />}
        {!isLoading && !error && filteredPlaces.length === 0 && (
          <EmptyState icon="📍" message="아이돌을 선택하면 관련 장소가 표시돼요." />
        )}
        {!isLoading && filteredPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            image={place.image}
            name={place.name}
            description={place.description || place.address}
            onClick={() => onPlaceClick?.(place.id)}
            badge={sort === '거리순' ? '최단 거리' : undefined}
          />
        ))}
      </CardList>
    </Panel>
  )
}
