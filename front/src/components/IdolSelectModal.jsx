import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(40, 40, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* 🌟 마이페이지 쌓임 맥락을 확실히 뚫도록 z-index 상향 유지 */
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 24px 20px;
  width: 500px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
`;

/* 제목 */
const Title = styled.p`
  color: #e8c664;
  font-family: "YPairing", sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 14px;
`;

const IdolHighlight = styled.strong`
  color: #e8b664;
  font-family: "YPairing", sans-serif;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

/* 카드 그리드 감싸는 노리끼리 회색 배경 박스 */
const GridWrap = styled.div`
  border-radius: 10px 10px 0 0;
  background: rgba(230, 227, 208, 0.34);
  padding: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

/* 카드: 이미지만 */
const Card = styled.button`
  border: none;
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: #f0f0f0;
  aspect-ratio: 3 / 4;
  display: block;
  transition:
    transform 0.18s,
    box-shadow 0.18s;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
`;

export default function IdolSelectModal({ isOpen, idols, onSelect }) {
  // 🌟 [수정된 방어선]
  // 부모가 명시적으로 모달을 열지 않은 상태(!isOpen)일 때만 자동 팝업 차단 로직이 작동하게 합니다.
  // 이렇게 하면 마이페이지에서 버튼을 눌러 isOpen이 true가 되었을 때는 정상적으로 모달이 열립니다.
  if (!isOpen) {
    const storageUser = localStorage.getItem("user");
    const storageIdol = localStorage.getItem("selected_idol");

    if (storageIdol) return null;

    if (storageUser) {
      try {
        const parsedUser = JSON.parse(storageUser);
        if (
          parsedUser.favorite_idol ||
          parsedUser.favoriteIdol ||
          parsedUser.favorite
        ) {
          return null;
        }
      } catch (e) {
        console.error("모달 내부 세션 파싱 실패:", e);
      }
    }

    // isOpen이 false이고 스토리지 조건도 안 걸리면 당연히 안 보여야 하므로 null
    return null;
  }

  return (
    <Overlay onClick={() => onSelect(null)}>
      {" "}
      {/* 바깥 배경 터치 시 닫히도록 하려면 부모 핸들러 연동 권장 */}
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <GridWrap>
          <Title>
            따라가고 싶은 <IdolHighlight>아이돌</IdolHighlight> 선택! ⭐
          </Title>
          <Grid>
            {idols.map((idol) => (
              <Card
                key={idol.id}
                type="button"
                onClick={() => onSelect(idol)}
                title={`${idol.groupLabel} ${idol.name}`}
              >
                <img src={idol.image} alt={idol.name} />
              </Card>
            ))}
          </Grid>
        </GridWrap>
      </ModalCard>
    </Overlay>
  );
}
