import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Shell, Header, Title, LinkBtn, Empty } from './SectionShell'
import { useFavorites } from '../../hooks/useFavorites'
import { fetchPlaceDetail } from '../../services/placeService'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(45,47,54,0.05);
  &:last-child { border-bottom: none; }
`

const Thumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #d9d9d9;
  flex-shrink: 0;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const PlaceInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const PlaceName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #2d2f36;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PlaceAddr = styled.p`
  font-size: 11px;
  color: rgba(45,47,54,0.45);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StarBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #e8d664;
  cursor: pointer;
`

export default function FavoritesSection({ onMapClick }) {
  const { favorites, toggleFavorite } = useFavorites()
  const [places, setPlaces] = useState([])

  useEffect(() => {
    if (favorites.length === 0) { setPlaces([]); return }
    Promise.all(favorites.map((id) => fetchPlaceDetail(id).catch(() => null)))
      .then((res) => setPlaces(res.filter(Boolean)))
  }, [favorites])

  return (
    <Shell>
      <Header>
        <Title>⭐ 즐겨찾기</Title>
        <LinkBtn onClick={onMapClick}>지도에서 보기</LinkBtn>
      </Header>
      {places.length === 0
        ? <Empty>즐겨찾기한 장소가 없어요.</Empty>
        : places.map((place) => (
            <Row key={place.id}>
              <Thumb>{place.image && <img src={place.image} alt={place.name} />}</Thumb>
              <PlaceInfo>
                <PlaceName>{place.name}</PlaceName>
                <PlaceAddr>{place.address}</PlaceAddr>
              </PlaceInfo>
              <StarBtn onClick={() => toggleFavorite(place.id)}>★</StarBtn>
            </Row>
          ))
      }
    </Shell>
  )
}
