import React, { useState } from 'react';

// 목표 선택 화면 - 자녀의 생애 이벤트와 연결하여 감성적 동기 부여
function GoalSelection({ childInfo, onGoalSelected }) {
  const [selected, setSelected] = useState(null);

  // 자녀 생년월일로부터 "20살까지 몇 년 남았는지" 자동 계산
  const calcYearsUntil20 = () => {
    if (!childInfo?.birthDate) return 20;
    const birthYear = new Date(childInfo.birthDate).getFullYear();
    const targetYear = birthYear + 20;
    const yearsLeft = targetYear - new Date().getFullYear();
    // 이미 20살이 넘었으면 "성인이 된" 문구로 대체
    return yearsLeft > 0 ? yearsLeft : null;
  };

  const yearsUntil20 = calcYearsUntil20();

  // 목표 카드 정의
  const goals = [
    {
      id: 'tuition',
      title: '대학 등록금',
      subtitle: '및 유학 자금',
      description: '4년 등록금 + 생활비,\n유학까지 여유롭게',
      icon: '🎓', // 추후 SVG로 교체 권장
      iconText: '학',
    },
    {
      id: 'jeonse',
      title: '첫 전셋집',
      subtitle: '마련 보증금',
      description: '사회 초년생의 독립,\n든든한 보증금 선물',
      icon: '🏠',
      iconText: '집',
    },
    {
      id: 'seedmoney',
      title: '시드머니',
      subtitle: '사회초년생 자산 기반',
      description: '투자 시작의 씨앗,\n경제적 자립의 첫걸음',
      icon: '💰',
      iconText: '돈',
    },
  ];

  // 카드 선택 처리
  const handleSelect = (goalId) => {
    setSelected(goalId);
  };

  // 선택 완료 → 부모로 전달
  const handleConfirm = () => {
    if (selected) {
      onGoalSelected(selected);
    }
  };

  // "아직 모르겠어요" 탈출구
  const handleSkip = () => {
    onGoalSelected('general');
  };

  return (
    <div style={styles.container}>
      {/* 상단 질문 영역 */}
      <div style={styles.header}>
        <p style={styles.subTitle}>
          {childInfo?.name}님이
          {yearsUntil20
            ? ` ${yearsUntil20}년 후 `
            : ' 성인이 되어 '}
          독립할 때,
        </p>
        <h1 style={styles.mainTitle}>
          가장 선물하고 싶은 것은<br />무엇인가요?
        </h1>
        <p style={styles.description}>
          목표를 선택하면 맞춤형 씨드머니 플랜을 만들어 드릴게요.
        </p>
      </div>

      {/* 목표 카드 3개 */}
      <div style={styles.cardGrid}>
        {goals.map((goal) => {
          const isSelected = selected === goal.id;
          return (
            <button
              key={goal.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
              }}
              onClick={() => handleSelect(goal.id)}
            >
              {/* 아이콘 뱃지 */}
              <div style={{
                ...styles.iconBadge,
                ...(isSelected ? styles.iconBadgeSelected : {}),
              }}>
                <span style={styles.iconText}>{goal.iconText}</span>
              </div>

              {/* 카드 텍스트 */}
              <div style={styles.cardTextArea}>
                <p style={styles.cardTitle}>{goal.title}</p>
                <p style={styles.cardSubTitle}>{goal.subtitle}</p>
                <p style={styles.cardDesc}>{goal.description}</p>
              </div>

              {/* 선택됨 표시 */}
              {isSelected && (
                <div style={styles.checkBadge}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 확인 버튼 */}
      <button
        style={{
          ...styles.confirmButton,
          ...(selected ? {} : styles.confirmButtonDisabled),
        }}
        onClick={handleConfirm}
        disabled={!selected}
      >
        {selected
          ? `${goals.find(g => g.id === selected)?.title} 목표로 시작하기`
          : '목표를 선택해 주세요'
        }
      </button>

      {/* 탈출구: 아직 모르겠어요 */}
      <button style={styles.skipButton} onClick={handleSkip}>
        아직 모르겠어요 — 종합 플랜으로 시작
      </button>
    </div>
  );
}

// 인라인 스타일 (v1.2.0 디자인 시스템 준수)
const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFDF9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px 40px',
    fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    maxWidth: '480px',
  },
  subTitle: {
    fontSize: '16px',
    color: '#FF8C69',
    fontWeight: 600,
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#3D2C2C',
    lineHeight: 1.4,
    margin: '0 0 16px 0',
  },
  description: {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: 0,
    lineHeight: 1.6,
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '420px',
    marginBottom: '28px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '20px',
    border: '2px solid #F3F4F6',
    background: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    position: 'relative',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  cardSelected: {
    border: '2px solid #FF8C69',
    background: '#FFF5F3',
    boxShadow: '0 4px 20px rgba(255,140,105,0.2)',
  },
  iconBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: '#F9FAFB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBadgeSelected: {
    background: '#FFE8E0',
  },
  iconText: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#FF8C69',
  },
  cardTextArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#3D2C2C',
    margin: '0 0 2px 0',
  },
  cardSubTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FF8C69',
    margin: '0 0 6px 0',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#9CA3AF',
    lineHeight: 1.5,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  checkBadge: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#FF8C69',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    width: '100%',
    maxWidth: '420px',
    padding: '18px 24px',
    borderRadius: '16px',
    background: '#FF8C69',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(255,140,105,0.35)',
    transition: 'opacity 0.2s ease',
    fontFamily: 'inherit',
  },
  confirmButtonDisabled: {
    background: '#E5E7EB',
    color: '#9CA3AF',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  skipButton: {
    background: 'none',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit',
    padding: '8px',
  },
};

export default GoalSelection;
