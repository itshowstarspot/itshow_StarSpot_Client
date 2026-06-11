import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(40, 40, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 800;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  width: 500px;
  max-width: 94vw;
  max-height: 88vh;
  overflow: hidden; /* 🌟 둥근 모서리 밖으로 컨텐츠가 삐져나가지 않도록 제어 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
`;

/* 헤더 및 그리드를 감싸는 영역 (내부 스크롤 보장) */
const ScrollBody = styled.div`
  padding: 24px 24px 16px;
  overflow-y: auto;
  flex: 1;
`;

const Title = styled.p`
  color: #e8c664;
  font-family: "YPairing", sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 18px;
`;

const IdolHighlight = styled.strong`
  color: #e8b664;
  font-family: "YPairing", sans-serif;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 8px;
`;

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

/* 하단 닫기 버튼 바 추가 */
const ModalFooter = styled.div`
  padding: 12px 24px 20px;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const CloseButton = styled.button`
  background: #f5f5f8;
  color: #2d2f36;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #e4e4e8;
  }
`;

// 🌟 onClose prop을 추가로 받아와 매핑합니다.
export default function IdolSelectModal({
  isOpen,
  idols = [],
  onSelect,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    /* 🌟 바깥 어두운 영역 누르면 모달 닫히도록 onClose 연결 */
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ScrollBody>
          <Title>
            따라가고 싶은 <IdolHighlight>아이돌</IdolHighlight> 선택! ⭐
          </Title>

          <Grid>
            {idols.map((idol) => (
              <Card
                key={idol.id}
                type="button"
                onClick={() => onSelect(idol)}
                title={`${idol.groupLabel || ""} ${idol.name || ""}`}
              >
                {/* 🌟 이미지 주소가 폭파되어도 하얀 화면으로 안 뻗도록 예외처리 */}
                <img
                  src={idol.image}
                  alt={idol.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150x200?text=No+Image";
                  }}
                />
              </Card>
            ))}
          </Grid>
        </ScrollBody>

        <ModalFooter>
          <CloseButton type="button" onClick={onClose}>
            취소
          </CloseButton>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  );
}
