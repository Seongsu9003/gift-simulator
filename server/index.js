const express = require('express');
const cors = require('cors');
const {
  GIFT_TAX_EXEMPTION,
  GIFT_TAX_RATES,
  INVESTMENT_CONSTANTS,
  AGE_CRITERIA
} = require('./constants');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '증여 시뮬레이터 서버가 정상 작동 중입니다!',
    apis: [
      'POST /api/roadmap - 30년 증여 로드맵 생성',
      'POST /api/tax - 증여세 계산',
      'POST /api/simulator - 수익률 시뮬레이션'
    ]
  });
});

// ===========================================
// 유틸리티 함수들
// ===========================================

/**
 * 생년월일로부터 현재 나이를 계산
 * @param {string} birthDate - YYYY-MM-DD 형태의 생년월일
 * @returns {number} 만 나이
 */
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * 나이와 관계에 따른 증여세 면제 한도 결정
 * @param {number} age - 만 나이
 * @param {string} relationship - 관계 ('child', 'spouse', 'other')
 * @returns {number} 면제 한도 (원)
 */
function getGiftTaxExemption(age, relationship = 'child') {
  if (relationship === 'spouse') {
    return GIFT_TAX_EXEMPTION.SPOUSE;
  } else if (relationship === 'other') {
    return GIFT_TAX_EXEMPTION.OTHER_RELATIVE;
  } else { // child (직계비속)
    return age < AGE_CRITERIA.ADULT_AGE
      ? GIFT_TAX_EXEMPTION.MINOR_CHILD
      : GIFT_TAX_EXEMPTION.ADULT_CHILD;
  }
}

/**
 * 증여세 계산 (누진세율 적용)
 * @param {number} taxableAmount - 과세 대상 금액 (면제 한도 초과분)
 * @returns {number} 계산된 세액
 */
function calculateGiftTax(taxableAmount) {
  if (taxableAmount <= 0) return 0;

  // 누진세율 구간에서 해당하는 세율 찾기
  const taxBracket = GIFT_TAX_RATES.find(bracket =>
    taxableAmount > bracket.min && taxableAmount <= bracket.max
  );

  if (!taxBracket) return 0;

  // 세액 = (과세표준 × 세율) - 누진공제
  return Math.max(0, (taxableAmount * taxBracket.rate) - taxBracket.deduction);
}

/**
 * 복리 수익률 계산
 * @param {number} monthlyAmount - 월 적립액
 * @param {number} months - 투자 개월 수
 * @param {number} monthlyRate - 월 수익률
 * @returns {number} 최종 예상 자산
 */
function calculateCompoundReturn(monthlyAmount, months, monthlyRate) {
  let totalAssets = 0;

  for (let month = 1; month <= months; month++) {
    // 매월 말에 입금하고 수익률 적용
    totalAssets = (totalAssets + monthlyAmount) * (1 + monthlyRate);
  }

  return Math.round(totalAssets);
}

// ===========================================
// API 라우트들
// ===========================================

/**
 * 1. POST /api/roadmap - 30년 증여 로드맵 생성
 * 입력: 자녀 생년월일, 관계, 기존 증여액, 월 적립액
 * 출력: 10년 단위 구간별 증여 플랜
 */
app.post('/api/roadmap', (req, res) => {
  try {
    const {
      childBirthDate,
      relationship = 'child',
      existingGiftAmount = 0,
      monthlyInvestment
    } = req.body;

    // 입력값 검증
    if (!childBirthDate || !monthlyInvestment) {
      return res.status(400).json({
        error: '필수 입력값이 누락되었습니다.',
        required: ['childBirthDate', 'monthlyInvestment']
      });
    }

    const currentAge = calculateAge(childBirthDate);
    const currentYear = new Date().getFullYear();

    // 30년간 10년 단위 구간별 계획 생성
    const roadmapPeriods = [];

    for (let period = 0; period < 3; period++) { // 0-10세, 10-20세, 20-30세
      const periodStartAge = period * 10;
      const periodEndAge = (period + 1) * 10;
      const periodStartYear = currentYear + Math.max(0, periodStartAge - currentAge);
      const periodEndYear = currentYear + Math.max(0, periodEndAge - currentAge);

      // 해당 구간의 나이로 면제 한도 계산 (구간 중간 나이 기준)
      const midAge = periodStartAge + 5;
      const exemptionLimit = getGiftTaxExemption(midAge, relationship);

      // 10년간 총 적립 가능한 금액 (월 적립액 × 12개월 × 10년)
      const totalInvestmentCapacity = monthlyInvestment * 12 * 10;

      // 추천 증여액 = min(면제한도, 총 적립 가능액)
      const recommendedGiftAmount = Math.min(exemptionLimit, totalInvestmentCapacity);

      // 절세 효과 계산 (면제 한도 활용으로 인한 세금 절약)
      // 만약 면제 한도를 활용하지 않았다면 납부했을 세액
      const potentialTaxWithoutExemption = calculateGiftTax(recommendedGiftAmount);
      const actualTax = calculateGiftTax(Math.max(0, recommendedGiftAmount - exemptionLimit));
      const taxSavings = potentialTaxWithoutExemption - actualTax;

      roadmapPeriods.push({
        period: `${periodStartAge}-${periodEndAge}세`,
        startYear: periodStartYear,
        endYear: periodEndYear,
        ageCategory: midAge < AGE_CRITERIA.ADULT_AGE ? '미성년' : '성인',
        exemptionLimit,
        recommendedGiftAmount,
        taxSavings: Math.max(0, taxSavings),
        exemptionUsageRate: Math.round((recommendedGiftAmount / exemptionLimit) * 100)
      });
    }

    // 전체 30년 요약 정보
    const totalRecommendedGift = roadmapPeriods.reduce((sum, period) => sum + period.recommendedGiftAmount, 0);
    const totalTaxSavings = roadmapPeriods.reduce((sum, period) => sum + period.taxSavings, 0);
    const totalExemptionUsed = roadmapPeriods.reduce((sum, period) => sum + period.exemptionLimit, 0);

    res.json({
      success: true,
      data: {
        childInfo: {
          currentAge,
          birthDate: childBirthDate,
          relationship
        },
        planSummary: {
          totalRecommendedGift,
          totalTaxSavings,
          totalExemptionUsed,
          monthlyInvestment,
          existingGiftAmount
        },
        roadmapPeriods
      }
    });

  } catch (error) {
    console.error('Roadmap API 오류:', error);
    res.status(500).json({
      error: '로드맵 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * 2. POST /api/tax - 증여세 계산
 * 입력: 증여 금액, 관계, 현재까지 누적 증여액
 * 출력: 면제 한도 사용률, 초과 금액, 납부 세액
 */
app.post('/api/tax', (req, res) => {
  try {
    const {
      giftAmount,
      relationship = 'child',
      currentAge = 20,
      accumulatedGiftAmount = 0
    } = req.body;

    // 입력값 검증
    if (giftAmount === undefined || giftAmount < 0) {
      return res.status(400).json({
        error: '증여 금액이 올바르지 않습니다.',
        required: ['giftAmount']
      });
    }

    // 면제 한도 계산
    const exemptionLimit = getGiftTaxExemption(currentAge, relationship);

    // 10년 단위 누적 증여액 (기존 + 신규)
    const totalGiftInPeriod = accumulatedGiftAmount + giftAmount;

    // 면제 한도 사용률
    const exemptionUsageRate = Math.min(100, Math.round((totalGiftInPeriod / exemptionLimit) * 100));

    // 면제 한도 초과 금액
    const excessAmount = Math.max(0, totalGiftInPeriod - exemptionLimit);

    // 납부할 세액 계산
    const taxAmount = calculateGiftTax(excessAmount);

    // 실제 수령액 (증여액 - 세금)
    const netReceiveAmount = giftAmount - (excessAmount > 0 ? Math.round(taxAmount * (giftAmount / totalGiftInPeriod)) : 0);

    res.json({
      success: true,
      data: {
        giftAmount,
        relationship,
        ageCategory: currentAge < AGE_CRITERIA.ADULT_AGE ? '미성년' : '성인',
        exemptionLimit,
        accumulatedGiftAmount,
        totalGiftInPeriod,
        exemptionUsageRate,
        excessAmount,
        taxAmount: Math.round(taxAmount),
        netReceiveAmount: Math.max(0, netReceiveAmount),
        isExemptionExceeded: excessAmount > 0
      }
    });

  } catch (error) {
    console.error('Tax API 오류:', error);
    res.status(500).json({
      error: '증여세 계산 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * 3. POST /api/simulator - 수익률 시뮬레이션
 * 입력: 월 적립액, 투자 기간(년)
 * 출력: 연도별 예상 자산 (연 10.23% 복리 고정)
 */
app.post('/api/simulator', (req, res) => {
  try {
    const { monthlyAmount, investmentYears } = req.body;

    // 입력값 검증
    if (!monthlyAmount || !investmentYears || monthlyAmount < 0 || investmentYears < 0) {
      return res.status(400).json({
        error: '월 적립액과 투자 기간이 올바르지 않습니다.',
        required: ['monthlyAmount', 'investmentYears']
      });
    }

    // 월 적립액 범위 검증
    if (monthlyAmount < INVESTMENT_CONSTANTS.MIN_MONTHLY_INVESTMENT ||
        monthlyAmount > INVESTMENT_CONSTANTS.MAX_MONTHLY_INVESTMENT) {
      return res.status(400).json({
        error: `월 적립액은 ${INVESTMENT_CONSTANTS.MIN_MONTHLY_INVESTMENT.toLocaleString()}원 ~ ${INVESTMENT_CONSTANTS.MAX_MONTHLY_INVESTMENT.toLocaleString()}원 사이여야 합니다.`
      });
    }

    const totalMonths = investmentYears * 12;
    const monthlyRate = INVESTMENT_CONSTANTS.MONTHLY_RETURN_RATE;

    // 연도별 자산 증가 시뮬레이션
    const yearlyProjection = [];
    let runningAssets = 0;

    for (let year = 1; year <= investmentYears; year++) {
      const monthsElapsed = year * 12;
      const cumulativeInvestment = monthlyAmount * monthsElapsed;

      // 해당 연도까지의 예상 자산
      runningAssets = calculateCompoundReturn(monthlyAmount, monthsElapsed, monthlyRate);

      const totalReturn = runningAssets - cumulativeInvestment;
      const returnRate = cumulativeInvestment > 0 ? (totalReturn / cumulativeInvestment) * 100 : 0;

      yearlyProjection.push({
        year,
        cumulativeInvestment,
        projectedAssets: runningAssets,
        totalReturn,
        returnRate: Math.round(returnRate * 100) / 100, // 소수점 2자리
        monthlyAmount
      });
    }

    // 최종 요약 정보
    const finalProjection = yearlyProjection[yearlyProjection.length - 1];
    const totalInvestment = monthlyAmount * totalMonths;
    const finalAssets = calculateCompoundReturn(monthlyAmount, totalMonths, monthlyRate);
    const totalProfit = finalAssets - totalInvestment;
    const totalReturnMultiple = totalInvestment > 0 ? finalAssets / totalInvestment : 0;

    res.json({
      success: true,
      data: {
        investmentDetails: {
          monthlyAmount,
          investmentYears,
          totalMonths,
          annualReturnRate: INVESTMENT_CONSTANTS.ANNUAL_RETURN_RATE * 100 // 퍼센트로 변환
        },
        summary: {
          totalInvestment,
          finalAssets,
          totalProfit,
          totalReturnMultiple: Math.round(totalReturnMultiple * 100) / 100
        },
        yearlyProjection
      }
    });

  } catch (error) {
    console.error('Simulator API 오류:', error);
    res.status(500).json({
      error: '수익률 시뮬레이션 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({
    error: '내부 서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    error: '요청하신 API를 찾을 수 없습니다.',
    availableEndpoints: [
      'GET /',
      'POST /api/roadmap',
      'POST /api/tax',
      'POST /api/simulator'
    ]
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 증여 시뮬레이터 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 사용 가능한 API:`);
  console.log(`   - GET /                   : 서버 상태 확인`);
  console.log(`   - POST /api/roadmap       : 30년 증여 로드맵 생성`);
  console.log(`   - POST /api/tax          : 증여세 계산`);
  console.log(`   - POST /api/simulator    : 수익률 시뮬레이션`);
});