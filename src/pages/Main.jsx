import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import yellowStar from '../assets/logo/yellow-star.png'
import mainLogo from '../assets/logo.svg'

const Page = styled.main`
  min-height: 100vh;
  background: #f5f5f8;
  color: #2d2f36;
  display: flex;
  flex-direction: column;
`

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 60px;
  text-align: center;
  gap: 20px;
  background: radial-gradient(ellipse at 50% 0%, rgba(232,214,100,0.18) 0%, transparent 70%);
`

const Logo = styled.img`
  width: 180px;
  object-fit: contain;
  margin-bottom: 8px;
`

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
  color: #2d2f36;
  span { color: #b8962a; }
`

const HeroDesc = styled.p`
  font-size: 16px;
  color: rgba(45,47,54,0.6);
  max-width: 400px;
  line-height: 1.7;
`

const SelectedIdolBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(232,214,100,0.12);
  border: 1.5px solid rgba(232,214,100,0.4);
  border-radius: 12px;
  margin-top: 8px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
`

const SelectedLabel = styled.span`
  font-size: 14px;
  color: #b8962a;
  font-weight: 600;
`

const FeaturesSection = styled.section`
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  img { width: 20px; }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`

const FeatureCard = styled.button`
  background: #ffffff;
  border: 1px solid rgba(45,47,54,0.08);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s;
  color: #2d2f36;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    background: rgba(232,214,100,0.08);
    border-color: rgba(232,214,100,0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(232,214,100,0.15);
  }
`

const FeatureIcon = styled.span`font-size: 28px;`

const FeatureName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #2d2f36;
`

const FeatureDesc = styled.span`
  font-size: 12px;
  color: rgba(45,47,54,0.5);
  line-height: 1.5;
`

const features = [
  { icon: '🗺️', name: '지도 탐색', desc: '아이돌 관련 장소를 지도에서 찾아보세요', path: '/home' },
  { icon: '🔍', name: '장소 검색', desc: '가고 싶은 장소를 검색해보세요', path: '/home' },
  { icon: '📍', name: '코스 만들기', desc: '여러 장소를 묶어 나만의 코스를 만드세요', path: '/course' },
  { icon: '📸', name: '팬 피드', desc: '팬들의 방문 후기를 확인하세요', path: '/feed' },
  { icon: '🗓️', name: '방문 기록', desc: '내 방문 기록을 관리하세요', path: '/history' },
  { icon: '🖼️', name: '포토 프레임', desc: '아이돌 프레임으로 사진을 꾸며보세요', path: '/photoframe' },
]

/**
 * Main 페이지 - 서비스 소개 및 아이돌 선택 안내
 */
export default function Main({ selectedIdol, onChangeIdol }) {
  const navigate = useNavigate()

  return (
    <Page>
      <Hero>
        <Logo src={mainLogo} alt="Star Spot" />
        <HeroTitle>
          최애 아이돌의 <span>발자국</span>을<br />따라가 보세요
        </HeroTitle>
        <HeroDesc>
          Star Spot은 아이돌이 다녀간 장소를 지도로 탐색하고,
          코스를 만들고, 팬들과 공유할 수 있는 서비스입니다.
        </HeroDesc>

        {selectedIdol ? (
          <SelectedIdolBanner>
            <img src={selectedIdol.image} alt={selectedIdol.name} />
            <SelectedLabel>현재 최애: {selectedIdol.groupLabel} {selectedIdol.name}</SelectedLabel>
            <Button variant="ghost" size="sm" onClick={onChangeIdol}>변경</Button>
          </SelectedIdolBanner>
        ) : (
          <Button size="lg" onClick={onChangeIdol}>
            <img src={yellowStar} alt="" style={{ width: 20 }} /> 아이돌 선택하기
          </Button>
        )}

        <Button variant="secondary" size="md" onClick={() => navigate('/home')}>
          지도로 시작하기
        </Button>
      </Hero>

      <FeaturesSection>
        <SectionTitle>
          <img src={yellowStar} alt="" /> 주요 기능
        </SectionTitle>
        <FeatureGrid>
          {features.map((f) => (
            <FeatureCard key={f.name} onClick={() => navigate(f.path)}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <FeatureName>{f.name}</FeatureName>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>
    </Page>
  )
}
