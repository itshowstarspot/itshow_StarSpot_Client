import { useState } from 'react'
import styled from 'styled-components'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
`

/* ── 출발지/도착지 입력 박스 ── */
const InputSection = styled.div`
  flex-shrink: 0;
  padding: 12px 14px 0;
  margin-bottom: 14px;
`

const InputBox = styled.div`
  border: 1.5px solid #e8d664;
  border-radius: 8px;
  overflow: hidden;
`

const InputRow = styled.div`
  display: flex;
  align-items: stretch;

  & + & {
    border-top: 1.5px solid #e8d664;
  }
`

const InputLabel = styled.div`
  width: 52px;
  flex-shrink: 0;
  background: rgba(232, 214, 100, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #7a6a10;
  border-right: 1.5px solid #e8d664;
`

const InputField = styled.input`
  flex: 1;
  height: 42px;
  border: none;
  padding: 0 12px;
  font-size: 13px;
  color: #2d2f36;
  background: #ffffff;
  outline: none;

  &::placeholder { color: rgba(45, 47, 54, 0.3); }
`

/* ── 추천 코스 섹션 ── */
const SectionRow = styled.div`
  flex-shrink: 0;
  padding: 0 14px;
  margin-bottom: 10px;
`

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 8px;
`

const SectionLine = styled.div`
  height: 1px;
  background: rgba(45, 47, 54, 0.1);
`

/* ── 카드 목록 ── */
const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 47, 54, 0.15);
    border-radius: 4px;
  }
`

const RouteCard = styled.div`
  border: 1.5px solid #e8d664;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
`

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2d2f36;
  margin-bottom: 3px;
`

const CardDesc = styled.div`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.45);
  margin-bottom: 10px;
  line-height: 1.4;
`

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`

const Badge = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e8d664;
  color: #1a1a1a;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`

const StepRight = styled.div`
  flex: 1;
`

const StepMain = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #2d2f36;
  display: flex;
  align-items: center;
  gap: 4px;
`

const StepTime = styled.span`
  font-size: 11px;
  color: #e8b664;
  font-weight: 600;
`

const StepSub = styled.div`
  font-size: 11px;
  color: rgba(45, 47, 54, 0.4);
  margin-top: 1px;
`

const NaverLink = styled.a`
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: #4a9d8f;
  text-decoration: none;
  text-align: right;

  &:hover { text-decoration: underline; }
`

const DUMMY_ROUTES = [
  {
    id: 1,
    name: '식당 이름',
    desc: '인스타에 수시로 업로드 되는 집',
    steps: [
      { station: '신림역', time: '15분', sub: '2호선 답승 → 강변역 하차' },
      { station: '강변역', time: '30분', sub: '고번 출구 → 1번 싱가' },
    ],
  },
  {
    id: 2,
    name: '식당 이름',
    desc: '사장님이 맛있고 음식이 친절해요',
    steps: [
      { station: '신림역', time: '15분', sub: '2호선 답승 → 방배역 하차' },
      { station: '방배역', time: '15분', sub: '1번 출구 → 9번 싱가' },
    ],
  },
]

export default function RoutePanel() {
  const [origin, setOrigin] = useState('')
  const [dest, setDest] = useState('')

  return (
    <Panel>
      <InputSection>
        <InputBox>
          <InputRow>
            <InputLabel>출발지</InputLabel>
            <InputField
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="출발지를 입력하세요"
            />
          </InputRow>
          <InputRow>
            <InputLabel>도착지</InputLabel>
            <InputField
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              placeholder="가고 싶은 장소를 입력하세요..."
            />
          </InputRow>
        </InputBox>
      </InputSection>

      <SectionRow>
        <SectionLabel>추천 코스</SectionLabel>
        <SectionLine />
      </SectionRow>

      <CardList>
        {DUMMY_ROUTES.map((route) => (
          <RouteCard key={route.id}>
            <CardTitle>{route.name}</CardTitle>
            <CardDesc>{route.desc}</CardDesc>
            <StepList>
              {route.steps.map((step, i) => (
                <Step key={i}>
                  <Badge>{i + 1}</Badge>
                  <StepRight>
                    <StepMain>
                      {step.station} <StepTime>{step.time}</StepTime>
                    </StepMain>
                    <StepSub>{step.sub}</StepSub>
                  </StepRight>
                </Step>
              ))}
            </StepList>
            <NaverLink href="#" target="_blank" rel="noopener noreferrer">
              네이버 지도에서 더보기
            </NaverLink>
          </RouteCard>
        ))}
      </CardList>
    </Panel>
  )
}
