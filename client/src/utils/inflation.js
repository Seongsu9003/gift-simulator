/**
 * 인플레이션 계산 유틸리티
 * 출처: 통계청 소비자물가지수 기반 연평균 3% 적용
 * 기준연도: 2026년
 */

// 연 물가상승률 고정값 (통계청 기반)
export const INFLATION_RATE = 0.03;

// 예금 연 수익률 고정값 (한국은행 기준금리 기반)
export const DEPOSIT_RATE = 0.035;

// 목표별 2026년 현재 가치 기준값 (만원 단위)
// 주기적 업데이트 필요 (연 1회 권장)
export const GOAL_BASE_AMOUNTS = {
  tuition: 4000,    // 4년 사립 대학 등록금 약 4,000만원
  jeonse: 30000,    // 서울 평균 전세 보증금 약 3억원
  seedmoney: 5000,  // 사회초년생 시드머니 약 5,000만원
};

// 목표별 한국 데이터 참고치 (스토리텔링용)
export const GOAL_REFERENCE_DATA = {
  tuition: {
    label: '대학 등록금',
    past: '2015년 약 1,500만원 (4년 기준)',
    present: '2026년 약 4,000만원',
    changeRate: '+167%',
  },
  jeonse: {
    label: '서울 전세 보증금',
    past: '2015년 약 5억원 (서울 평균)',
    present: '2026년 약 9억원',
    changeRate: '+80%',
  },
  seedmoney: {
    label: '사회초년생 시드머니',
    past: '2015년 약 2,000만원 기준',
    present: '2026년 약 5,000만원 기준',
    changeRate: '+150%',
  },
};

/**
 * 인플레이션 반영 미래 금액 계산
 * @param {number} baseAmountMan - 현재 기준 금액 (만원 단위)
 * @param {number} yearsUntilGoal - 목표까지 남은 년수
 * @returns {number} 인플레이션 반영 후 예상 금액 (만원 단위)
 */
export function calcInflatedAmount(baseAmountMan, yearsUntilGoal) {
  if (yearsUntilGoal <= 0) return baseAmountMan;
  return Math.round(baseAmountMan * Math.pow(1 + INFLATION_RATE, yearsUntilGoal));
}

/**
 * 자녀 생년월일 기준으로 목표 나이까지 남은 연수 계산
 * @param {string} birthDate - 생년월일 (YYYY-MM-DD)
 * @param {number} targetAge - 목표 나이 (기본: 20세)
 * @returns {number} 남은 연수
 */
export function calcYearsUntilGoal(birthDate, targetAge = 20) {
  if (!birthDate) return 20;
  const birthYear = new Date(birthDate).getFullYear();
  const targetYear = birthYear + targetAge;
  const yearsLeft = targetYear - new Date().getFullYear();
  return Math.max(yearsLeft, 0);
}

/**
 * 예금 월 적립식 복리 예상 자산 계산 (연도별 배열 반환)
 * @param {number} monthlyAmount - 월 적립액 (원 단위)
 * @param {number} totalYears - 투자 기간 (년)
 * @param {number} annualRate - 연 수익률 (기본: 3.5%)
 * @returns {Array} [{year, depositAssets, cumulativeInvestment}, ...]
 */
export function calcDepositProjection(monthlyAmount, totalYears, annualRate = DEPOSIT_RATE) {
  const monthlyRate = annualRate / 12;
  const result = [];

  for (let year = 1; year <= totalYears; year++) {
    const months = year * 12;
    const cumulativeInvestment = monthlyAmount * months;
    // 월 적립식 미래 가치 공식: FV = P * ((1+r)^n - 1) / r
    const depositAssets = Math.round(
      monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    );
    result.push({ year, depositAssets, cumulativeInvestment });
  }

  return result;
}

/**
 * 만원 단위로 포맷팅
 * @param {number} amountMan - 금액 (만원 단위)
 * @returns {string} 예: "3억 2,000만원" or "5,000만원"
 */
export function formatManWon(amountMan) {
  if (amountMan >= 10000) {
    const eok = Math.floor(amountMan / 10000);
    const rest = amountMan % 10000;
    if (rest === 0) return `${eok}억원`;
    return `${eok}억 ${new Intl.NumberFormat('ko-KR').format(rest)}만원`;
  }
  return `${new Intl.NumberFormat('ko-KR').format(amountMan)}만원`;
}
