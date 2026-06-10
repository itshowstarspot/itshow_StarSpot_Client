import bangJeemin from '../../assets/person/bangjeemin.png'
import day6Logo from '../../assets/person/day6.png'
import jungKook from '../../assets/person/jungkook.png'
import karina from '../../assets/person/karina.png'
import leeYoungji from '../../assets/person/leeyoungji.png'

import profileJungKook from '../../assets/profile/jungkook.png'
import profileBangJeemin from '../../assets/profile/bangjeemin.png'
import profileKarina from '../../assets/profile/karina.png'
import profileDay6 from '../../assets/profile/day6.png'
import profileLeeYoungji from '../../assets/profile/leeyoungji.png'

/**
 * @typedef {Object} Idol
 * @property {string} id
 * @property {string} groupLabel   - 그룹명 (카드 하단 좌측 표시)
 * @property {string} name         - 영문 멤버명 (카드 하단 우측, 대문자)
 * @property {string} image
 * @property {string} groupColor   - 카드 하단 바 & 선택 테두리 색상
 */
export const idols = [
  {
    id: 'jungkook',
    groupLabel: 'BTS',
    name: 'JUNG KOOK',
    image: jungKook,
    profile: profileJungKook,
    groupColor: '#5B4FD4',
  },
  {
    id: 'bangjeemin',
    groupLabel: 'izna',
    name: 'BANG JEEMIN',
    image: bangJeemin,
    profile: profileBangJeemin,
    groupColor: '#C084D4',
  },
  {
    id: 'karina',
    groupLabel: 'aespa',
    name: 'KARINA',
    image: karina,
    profile: profileKarina,
    groupColor: '#7B5BB8',
  },
  {
    id: 'youngk',
    groupLabel: 'DAY6',
    name: 'YOUNG K',
    image: day6Logo,
    profile: profileDay6,
    groupColor: '#4A8FC4',
  },
  {
    id: 'leeyoungji',
    groupLabel: 'Lee Youngji',
    name: 'LEE YOUNGJI',
    image: leeYoungji,
    profile: profileLeeYoungji,
    groupColor: '#E06090',
  },
]
