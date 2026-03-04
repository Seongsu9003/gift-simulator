import React, { useState } from 'react';

// 목표별 표시 문구 매핑
const GOAL_LABELS = {
  tuition: '대학 등록금 및 유학 자금',
  jeonse: '첫 전셋집 마련 보증금',
  seedmoney: '사회초년생 시드머니',
  general: '종합 플랜',
};

// 스텝 위자드 메인 컴포넌트
function StepWizard({ childInfo, selectedGoal }) {
  // 현재 스텝 상태 (1~4)
  const [currentStep, setCurrentStep] = useState(1);

  // 공유 데이터 상태 (Step 1에서 입력한 데이터를 Step 2~4에서 공유)
  const [wizardData, setWizardData] = useState({
    // Step 1: 자녀 정보 및 투자 정보
    childBirthDate: childInfo?.birthDate || '',
    relationship: childInfo?.relationship || 'child',
    existingGiftAmount: '',
    hasExistingGift: null,
    monthlyInvestment: '',

    // API 응답 데이터 저장
    roadmapResults: null,
    taxResults: null,
    simulatorResults: null
  });

  // 스텝 정의
  const steps = [
    { id: 1, title: '자녀 정보', description: '기본 정보 입력' },
    { id: 2, title: '씨드머니 계획', description: '30년 로드맵' },
    { id: 3, title: '예상 증여세 계산', description: '증여세 계산' },
    { id: 4, title: '투자시뮬레이션', description: '투자 시뮬레이션' }
  ];

  // 스텝 이동 함수
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 4) {
      setCurrentStep(stepNumber);
    }
  };

  // 다음 스텝으로 이동
  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 이전 스텝으로 이동
  const goPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 처음부터 다시 시작
  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({
      childBirthDate: childInfo?.birthDate || '',
      relationship: childInfo?.relationship || 'child',
      existingGiftAmount: '',
      hasExistingGift: null,
      monthlyInvestment: '',
      roadmapResults: null,
      taxResults: null,
      simulatorResults: null
    });
  };

  // 공유 데이터 업데이트 함수
  const updateWizardData = (newData) => {
    setWizardData(prev => ({
      ...prev,
      ...newData
    }));
  };

  // 목표 배너 렌더링 - selectedGoal이 있을 때만 표시
  const renderGoalBanner = () => {
    if (!selectedGoal || selectedGoal === 'general') return null;

    return (
      <div style={{
        background: '#FFF5F3',
        borderBottom: '1px solid #FFD9CC',
        padding: '10px 0',
      }}>
        <div className="container">
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#FF8C69',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FF8C69',
              flexShrink: 0,
            }} />
            목표: {GOAL_LABELS[selectedGoal]} 마련을 위한 씨드머니 계획
          </p>
        </div>
      </div>
    );
  };

  // 스텝 인디케이터 렌더링
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className="container">
          <div className="step-list">
            {steps.map((step, index) => (
              <div key={step.id} className="step-item-wrapper">
                <div
                  className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                  onClick={() => currentStep > step.id && goToStep(step.id)}
                  style={{ cursor: currentStep > step.id ? 'pointer' : 'default' }}
                >
                  <div className="step-number">
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="step-label">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 네비게이션 버튼 렌더링
  const renderNavigation = () => {
    return (
      <div className="step-navigation">
        <div className="nav-buttons">
          {currentStep > 1 && (
            <button
              className="nav-button nav-button-secondary"
              onClick={goPrevious}
            >
              ← 이전
            </button>
          )}

          <div className="nav-spacer"></div>

          {currentStep < 4 && (
            <button
              className="nav-button nav-button-primary"
              onClick={goNext}
              disabled={!canGoNext()}
            >
              다음 →
            </button>
          )}

          {currentStep === 4 && (
            <button
              className="nav-button nav-button-outline"
              onClick={resetWizard}
            >
              처음부터 다시
            </button>
          )}
        </div>
      </div>
    );
  };

  // 다음 스텝으로 갈 수 있는지 확인
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        // Step 1: 필수 입력값 확인
        return wizardData.childBirthDate && wizardData.monthlyInvestment &&
               parseInt(wizardData.monthlyInvestment) >= 10000;
      case 2:
        // Step 2: 로드맵 결과가 있어야 다음 가능
        return wizardData.roadmapResults !== null;
      case 3:
        // Step 3: 세금 계산 결과가 있어야 다음 가능
        return wizardData.taxResults !== null;
      default:
        return true;
    }
  };

  // 현재 스텝 컨텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ChildInfo
            childInfo={childInfo}
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goNext}
          />
        );
      case 2:
        return (
          <Step2Roadmap
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goNext}
          />
        );
      case 3:
        return (
          <Step3TaxCalculation
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goNext}
          />
        );
      case 4:
        return (
          <Step4Simulator
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="step-wizard">
      {/* 목표 배너 - 선택된 목표가 있을 때만 표시 */}
      {renderGoalBanner()}

      {/* 스텝 인디케이터 */}
      {renderStepIndicator()}

      {/* 메인 컨텐츠 영역 */}
      <main className="step-content">
        <div className="container">
          <div className="step-content-wrapper">
            {renderStepContent()}
          </div>
        </div>
      </main>

      {/* 네비게이션 버튼 */}
      {renderNavigation()}
    </div>
  );
}

// Step 1: 자녀 정보 입력 컴포넌트
function Step1ChildInfo({ childInfo, wizardData, updateWizardData, onNext }) {
  // 로컬 상태 (UI 전용)
  const [dateSelection, setDateSelection] = useState(() => {
    if (wizardData.childBirthDate) {
      const [year, month, day] = wizardData.childBirthDate.split('-');
      return {
        year: year,
        month: parseInt(month).toString(),
        day: parseInt(day).toString()
      };
    }
    return { year: '', month: '', day: '' };
  });

  // 날짜 선택 처리
  const handleDateChange = (field, value) => {
    setDateSelection(prev => {
      const newSelection = { ...prev, [field]: value };

      // 일 수 조정 (선택한 월에 맞게)
      if (field === 'month' && newSelection.day) {
        const daysInMonth = getDaysInMonth(parseInt(newSelection.year) || 2024, parseInt(value));
        if (parseInt(newSelection.day) > daysInMonth) {
          newSelection.day = daysInMonth.toString();
        }
      }

      // 전체 날짜가 선택되면 wizardData 업데이트
      if (newSelection.year && newSelection.month && newSelection.day) {
        const formattedDate = `${newSelection.year}-${newSelection.month.padStart(2, '0')}-${newSelection.day.padStart(2, '0')}`;
        updateWizardData({ childBirthDate: formattedDate });
      }

      return newSelection;
    });
  };

  // 월별 날짜 수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 입력값 변경 처리
  const handleInputChange = (field, value) => {
    updateWizardData({ [field]: value });
  };

  // 연도, 월, 일 옵션들
  const yearOptions = [];
  for (let year = 2026; year >= 1994; year--) {
    yearOptions.push(year);
  }

  const monthOptions = [];
  for (let month = 1; month <= 12; month++) {
    monthOptions.push(month);
  }

  const getDayOptions = () => {
    if (!dateSelection.year || !dateSelection.month) return [];
    const daysInMonth = getDaysInMonth(parseInt(dateSelection.year), parseInt(dateSelection.month));
    const dayOptions = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dayOptions.push(day);
    }
    return dayOptions;
  };

  return (
    <div className="step-container step1-container">
      <div className="step-header">
        <h2 className="step-title">자녀 정보를 입력해주세요</h2>
        <p className="step-subtitle">
          자녀의 기본 정보와 투자 계획을 입력하면 맞춤형 증여 플랜을 생성해드려요
        </p>
      </div>

      <div className="form-container">
        {/* 자동 입력된 자녀 정보 안내 */}
        {childInfo && (
          <div className="auto-filled-notice">
            <span className="notice-icon"></span>
            <span className="notice-text">
              {childInfo.name}님의 정보로 자동 입력되었어요
            </span>
          </div>
        )}

        {/* 자녀 생년월일 */}
        <div className="form-group">
          <label className="form-label">
            자녀 생년월일
          </label>
          <div className="date-picker-container">
            <select
              className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
              value={dateSelection.year}
              onChange={(e) => handleDateChange('year', e.target.value)}
              required
              disabled={childInfo}
            >
              <option value="">연도</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>

            <select
              className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
              value={dateSelection.month}
              onChange={(e) => handleDateChange('month', e.target.value)}
              required
              disabled={childInfo}
            >
              <option value="">월</option>
              {monthOptions.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>

            <select
              className={`form-select date-select ${childInfo ? 'readonly' : ''}`}
              value={dateSelection.day}
              onChange={(e) => handleDateChange('day', e.target.value)}
              required
              disabled={childInfo || (!dateSelection.year || !dateSelection.month)}
            >
              <option value="">일</option>
              {getDayOptions().map(day => (
                <option key={day} value={day}>{day}일</option>
              ))}
            </select>
          </div>
          {!childInfo && (
            <small style={{ color: '#8B6F6F', fontSize: '0.875rem' }}>
              자녀의 생년월일을 선택해주세요
            </small>
          )}
        </div>

        {/* 관계 선택 */}
        <div className="form-group">
          <label className="form-label">
            관계
          </label>
          <select
            className={`form-select ${childInfo ? 'readonly' : ''}`}
            value={wizardData.relationship}
            disabled={childInfo}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
          >
            <option value="child">자녀</option>
            <option value="other">기타 친족</option>
          </select>
        </div>

        {/* 기존 증여액 */}
        <div className="form-group">
          <label className="form-label">
            홈택스 증여신고금액 (원)
          </label>
          <div className="toggle-buttons" style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              className={`toggle-button ${wizardData.hasExistingGift === true ? 'selected' : ''}`}
              onClick={() => {
                handleInputChange('hasExistingGift', true);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: wizardData.hasExistingGift === true ? '2px solid #FF8C69' : '2px solid #E5E7EB',
                background: wizardData.hasExistingGift === true ? '#FFF5F3' : 'white',
                color: wizardData.hasExistingGift === true ? '#FF8C69' : '#6B7280',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              있어요
            </button>
            <button
              type="button"
              className={`toggle-button ${wizardData.hasExistingGift === false ? 'selected' : ''}`}
              onClick={() => {
                handleInputChange('hasExistingGift', false);
                handleInputChange('existingGiftAmount', '0');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: wizardData.hasExistingGift === false ? '2px solid #FF8C69' : '2px solid #E5E7EB',
                background: wizardData.hasExistingGift === false ? '#FFF5F3' : 'white',
                color: wizardData.hasExistingGift === false ? '#FF8C69' : '#6B7280',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              없어요
            </button>
          </div>
          {wizardData.hasExistingGift === true && (
            <input
              type="number"
              className="form-input"
              value={wizardData.existingGiftAmount}
              onChange={(e) => handleInputChange('existingGiftAmount', e.target.value)}
              placeholder="증여신고한 금액을 입력하세요"
              min="0"
            />
          )}
          <small style={{ color: '#6c757d', fontSize: '0.875rem' }}>
            현재 10년 구간에서 홈택스에 증여신고한 금액을 입력하세요
          </small>
        </div>

        {/* 월 적립액 */}
        <div className="form-group">
          <label className="form-label">
            월 적립 희망 금액 (원)
          </label>
          <input
            type="number"
            className="form-input"
            value={wizardData.monthlyInvestment}
            onChange={(e) => handleInputChange('monthlyInvestment', e.target.value)}
            placeholder="예: 100,000"
            min="10000"
            max="1000000"
            step="10000"
            required
          />
          <small style={{ color: '#8B6F6F', fontSize: '0.875rem' }}>
            월 10만원부터 시작해도 30년 후 큰 차이가 생겨요
          </small>
        </div>
      </div>
    </div>
  );
}

// Step 2: 30년 증여 로드맵 컴포넌트
function Step2Roadmap({ wizardData, updateWizardData, onNext }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 자동으로 API 호출
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!wizardData.roadmapResults) {
      handleCalculateRoadmap();
    }
  }, []);

  // 로드맵 계산 API 호출
  const handleCalculateRoadmap = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://gift-simulator-production.up.railway.app/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childBirthDate: wizardData.childBirthDate,
          relationship: wizardData.relationship,
          existingGiftAmount: parseInt(wizardData.existingGiftAmount) || 0,
          monthlyInvestment: parseInt(wizardData.monthlyInvestment)
        })
      });

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        updateWizardData({ roadmapResults: data.data });
      } else {
        throw new Error(data.error || '결과를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 퍼센트 포맷팅 함수
  const formatPercent = (percent) => {
    return percent + '%';
  };

  // 연령대별 이모지 아이콘
  const getAgeIcon = (ageCategory) => {
    if (ageCategory.includes('미성년')) {
      if (ageCategory.includes('0-10')) return '';
      return '';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="step-container step2-container">
        <div className="step-header">
          <h2 className="step-title">30년 증여 플랜 생성 중...</h2>
        </div>
        <div className="loading-content">
          <div className="loading-icon"></div>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="step-container step2-container">
        <div className="step-header">
          <h2 className="step-title">30년 증여 플랜</h2>
        </div>
        <div className="error-container">
          <div className="error">{error}</div>
          <button
            className="form-button"
            onClick={handleCalculateRoadmap}
            style={{ marginTop: '1rem' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const results = wizardData.roadmapResults;

  return (
    <div className="step-container step2-container">
      <div className="step-header">
        <h2 className="step-title">30년 증여 플랜이 완성되었어요!</h2>
        <p className="step-subtitle">
          자녀의 나이에 맞춘 최적의 증여 타이밍과 절세 효과를 확인해보세요
        </p>
      </div>

      {results && (
        <div className="result-container">
          {/* 요약 메시지 */}
          <div className="highlight-box">
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#FF8C69', fontWeight: 'bold', fontSize: '1.1rem' }}>
              30년간 총 {formatCurrency(results.planSummary.totalRecommendedGift)}을 면세로 증여할 수 있어요!
            </h3>
            <p style={{ margin: 0, color: '#8B6F6F', fontSize: '0.95rem' }}>
              절세 효과: <span className="text-success">{formatCurrency(results.planSummary.totalTaxSavings)}</span>
            </p>
          </div>

          {/* 30년 계획 요약 */}
          <div className="result-card">
            <h3 className="result-title">30년 계획 요약</h3>
            <div className="result-item">
              <span className="result-label">총 추천 증여액</span>
              <span className="result-value text-success">
                {formatCurrency(results.planSummary.totalRecommendedGift)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">총 절세 효과</span>
              <span className="result-value text-success">
                {formatCurrency(results.planSummary.totalTaxSavings)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">총 면제 한도</span>
              <span className="result-value">
                {formatCurrency(results.planSummary.totalExemptionUsed)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">월 적립액</span>
              <span className="result-value">
                {formatCurrency(results.planSummary.monthlyInvestment)}
              </span>
            </div>
          </div>

          {/* 구간별 상세 계획 */}
          <div className="result-card">
            <h3 className="result-title">구간별 상세 계획</h3>

            {results.roadmapPeriods.map((period, index) => (
              <div key={index} className="period-card" style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ margin: 0, color: '#3D2C2C' }}>
                    {getAgeIcon(period.ageCategory)} {period.period} ({period.ageCategory})
                  </h4>
                  <div style={{
                    background: period.exemptionUsageRate >= 80 ? '#dc3545' : '#28a745',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    면제한도 사용률: {formatPercent(period.exemptionUsageRate)}
                  </div>
                </div>

                <div className="result-item">
                  <span className="result-label">기간</span>
                  <span className="result-value">{period.startYear}년 ~ {period.endYear}년</span>
                </div>
                <div className="result-item">
                  <span className="result-label">면제 한도</span>
                  <span className="result-value">{formatCurrency(period.exemptionLimit)}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">추천 증여액</span>
                  <span className="result-value text-success">
                    {formatCurrency(period.recommendedGiftAmount)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">절세 효과</span>
                  <span className="result-value text-success">
                    {formatCurrency(period.taxSavings)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 3: 증여세 계산 컴포넌트
function Step3TaxCalculation({ wizardData, updateWizardData, onNext }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 자동으로 API 호출
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!wizardData.taxResults && wizardData.roadmapResults) {
      handleCalculateTax();
    }
  }, []);

  // 세금 계산 API 호출
  const handleCalculateTax = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1에서 입력한 데이터를 기반으로 자동 계산
      const childAge = calculateAge(wizardData.childBirthDate);
      const giftAmount = parseInt(wizardData.monthlyInvestment) * 12 * 10; // 10년간 적립 예상액

      const response = await fetch('https://gift-simulator-production.up.railway.app/api/tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftAmount: giftAmount,
          relationship: wizardData.relationship,
          currentAge: childAge,
          accumulatedGiftAmount: parseInt(wizardData.existingGiftAmount) || 0
        })
      });

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        updateWizardData({ taxResults: data.data });
      } else {
        throw new Error(data.error || '결과를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 나이 계산 함수
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 면제 한도 사용률 게이지 컴포넌트
  const ExemptionGauge = ({ usageRate, isExceeded }) => {
    const strokeColor = usageRate <= 50 ? '#28a745' : usageRate <= 80 ? '#ffc107' : '#dc3545';
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (circumference * Math.min(usageRate, 100)) / 100;

    return (
      <div className="gauge-container">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e9ecef"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={strokeColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div className="gauge-value" style={{
              fontSize: '1.5rem',
              color: strokeColor
            }}>
              {usageRate}%
            </div>
          </div>
        </div>
        <div className="gauge-label">
          면제 한도 사용률
          {isExceeded && (
            <div style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '0.25rem' }}>
              한도 초과
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="step-container step3-container">
        <div className="step-header">
          <h2 className="step-title">증여세 계산 중...</h2>
        </div>
        <div className="loading-content">
          <div className="loading-icon"></div>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="step-container step3-container">
        <div className="step-header">
          <h2 className="step-title">증여세 계산</h2>
        </div>
        <div className="error-container">
          <div className="error">{error}</div>
          <button
            className="form-button"
            onClick={handleCalculateTax}
            style={{ marginTop: '1rem' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const results = wizardData.taxResults;

  return (
    <div className="step-container step3-container">
      <div className="step-header">
        <h2 className="step-title">증여세 계산 결과</h2>
        <p className="step-subtitle">
          입력한 정보를 바탕으로 계산한 증여세 현황을 확인해보세요
        </p>
      </div>

      {results && (
        <div className="result-container">
          {/* 면제 한도 사용률 게이지 */}
          <div className="result-card">
            <h3 className="result-title">면제 한도 현황</h3>
            <ExemptionGauge
              usageRate={results.exemptionUsageRate}
              isExceeded={results.isExemptionExceeded}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                {results.ageCategory} 기준 면제 한도: <strong>{formatCurrency(results.exemptionLimit)}</strong>
              </div>
            </div>
          </div>

          {/* 증여 정보 */}
          <div className="result-card">
            <h3 className="result-title">증여 정보</h3>
            <div className="result-item">
              <span className="result-label">증여 금액</span>
              <span className="result-value" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatCurrency(results.giftAmount)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">수증자 분류</span>
              <span className="result-value">{results.ageCategory}</span>
            </div>
            <div className="result-item">
              <span className="result-label">관계</span>
              <span className="result-value">
                {results.relationship === 'child' ? '자녀' :
                 results.relationship === 'spouse' ? '배우자' : '기타 친족'}
              </span>
            </div>
          </div>

          {/* 세금 계산 결과 */}
          <div className="result-card">
            <h3 className="result-title">세금 계산 결과</h3>
            <div className="result-item">
              <span className="result-label">기존 누적 증여액</span>
              <span className="result-value">{formatCurrency(results.accumulatedGiftAmount)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">총 증여액 (10년 구간)</span>
              <span className="result-value">{formatCurrency(results.totalGiftInPeriod)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">면제 한도</span>
              <span className="result-value">{formatCurrency(results.exemptionLimit)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">한도 초과 금액</span>
              <span className="result-value" style={{
                color: results.excessAmount > 0 ? '#dc3545' : '#28a745',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.excessAmount)}
              </span>
            </div>
            <div className="result-item" style={{
              borderTop: '2px solid #e9ecef',
              paddingTop: '1rem',
              marginTop: '1rem'
            }}>
              <span className="result-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                납부할 증여세
              </span>
              <span className={`result-value ${results.taxAmount > 0 ? 'text-warning' : 'text-success'}`} style={{
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.taxAmount)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                실제 수령 금액
              </span>
              <span className="result-value text-success" style={{
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {formatCurrency(results.netReceiveAmount)}
              </span>
            </div>
          </div>

          {/* 세율 정보 */}
          <div className="info-box">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3D2C2C' }}>증여세율 정보</h4>
            <div style={{ color: '#3D2C2C', fontSize: '0.9rem' }}>
              <p style={{ margin: '0.25rem 0' }}>• 면제 한도 초과분에 대해 누진세율 적용</p>
              <p style={{ margin: '0.25rem 0' }}>• 1억원 이하: 10% / 1~5억원: 20% / 5~10억원: 30%</p>
              <p style={{ margin: '0.25rem 0' }}>• 10~30억원: 40% / 30억원 초과: 50%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: 수익률 시뮬레이션 컴포넌트
function Step4Simulator({ wizardData, updateWizardData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState(parseInt(wizardData.monthlyInvestment) || 100000);
  const [annualReturnRate, setAnnualReturnRate] = useState(10.23); // 연 수익률 상태 추가

  // 컴포넌트 마운트 시 자동으로 API 호출
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!wizardData.simulatorResults) {
      handleCalculateSimulator();
    }
  }, []);

  // 수익률 시뮬레이션 API 호출
  const handleCalculateSimulator = async (customAmount = null, customReturnRate = null) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://gift-simulator-production.up.railway.app/api/simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyAmount: customAmount || monthlyAmount,
          investmentYears: 30,
          annualReturnRate: customReturnRate || annualReturnRate
        })
      });

      if (!response.ok) {
        throw new Error('API 호출에 실패했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        updateWizardData({ simulatorResults: data.data });
      } else {
        throw new Error(data.error || '결과를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 슬라이더 변경 처리
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setMonthlyAmount(value);
  };

  // 슬라이더 변경 완료 시 재계산
  const handleSliderChangeComplete = () => {
    handleCalculateSimulator(monthlyAmount, annualReturnRate);
  };

  // 연 수익률 슬라이더 변경 처리
  const handleReturnRateChange = (e) => {
    const value = parseFloat(e.target.value);
    setAnnualReturnRate(value);
  };

  // 연 수익률 슬라이더 변경 완료 시 재계산
  const handleReturnRateChangeComplete = () => {
    handleCalculateSimulator(monthlyAmount, annualReturnRate);
  };

  // 기본값으로 되돌리기
  const handleResetToDefault = () => {
    setAnnualReturnRate(10.23);
    // 0.1초 후 재계산 (상태 업데이트 후)
    setTimeout(() => {
      handleCalculateSimulator(monthlyAmount, 10.23);
    }, 100);
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 간략한 금액 포맷팅 (차트용)
  const formatCurrencyShort = (amount) => {
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(1) + '억원';
    } else if (amount >= 10000000) {
      return (amount / 10000000).toFixed(0) + '천만원';
    } else if (amount >= 10000) {
      return (amount / 10000).toFixed(0) + '만원';
    }
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  if (loading) {
    return (
      <div className="step-container step4-container">
        <div className="step-header">
          <h2 className="step-title">수익률 계산 중...</h2>
        </div>
        <div className="loading-content">
          <div className="loading-icon"></div>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="step-container step4-container">
        <div className="step-header">
          <h2 className="step-title">수익률 시뮬레이션</h2>
        </div>
        <div className="error-container">
          <div className="error">{error}</div>
          <button
            className="form-button"
            onClick={() => handleCalculateSimulator()}
            style={{ marginTop: '1rem' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const results = wizardData.simulatorResults;

  return (
    <div className="step-container step4-container">
      <div className="step-header">
        <h2 className="step-title">30년 후 예상 자산이 나왔어요!</h2>
        <p className="step-subtitle">
          복리 효과로 얼마나 자산이 늘어나는지 확인해보세요
        </p>
      </div>

      {/* 월 적립액 조정 슬라이더 */}
      <div className="form-container">
        <div className="form-group">
          <label className="form-label">
            월 적립액: <strong>{formatCurrency(monthlyAmount)}</strong>
          </label>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={monthlyAmount}
            onChange={handleSliderChange}
            onMouseUp={handleSliderChangeComplete}
            onTouchEnd={handleSliderChangeComplete}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: '#ddd',
              outline: 'none',
              appearance: 'none'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#6c757d',
            marginTop: '0.5rem'
          }}>
            <span>1만원</span>
            <span>100만원</span>
          </div>
        </div>

        {/* 연 수익률 조정 슬라이더 */}
        <div className="form-group">
          <label className="form-label">
            연 수익률: <strong>{annualReturnRate.toFixed(2)}%</strong>
            <button
              onClick={handleResetToDefault}
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                color: '#FF8C69',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              기본값으로 되돌리기
            </button>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.01"
            value={annualReturnRate}
            onChange={handleReturnRateChange}
            onMouseUp={handleReturnRateChangeComplete}
            onTouchEnd={handleReturnRateChangeComplete}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: '#ddd',
              outline: 'none',
              appearance: 'none'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#6c757d',
            marginTop: '0.5rem'
          }}>
            <span>1%</span>
            <span>20%</span>
          </div>
        </div>

        {/* 수익률 안내 박스 */}
        <div style={{
          background: '#F0F9FF',
          border: '1px solid #E0F2FE',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <div style={{
            fontSize: '13px',
            color: '#6B7280',
            lineHeight: '1.5'
          }}>
            기본 수익률 10.23%는 S&P 500 지수의 최근 30년 연평균 수익률입니다.
            실제 투자 수익률은 시장 상황에 따라 달라질 수 있어요.
          </div>
        </div>
      </div>

      {results && (
        <div className="result-container">
          {/* 투자 요약 */}
          <div className="result-card">
            <h3 className="result-title">30년 투자 요약</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#e7f3ff',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C69' }}>
                  {formatCurrency(results.summary.totalInvestment)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  총 납입액
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#e8f5e8',
                borderRadius: '8px'
              }}>
                <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(results.summary.finalAssets)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  최종 예상 자산
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#fff3cd',
                borderRadius: '8px'
              }}>
                <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatCurrency(results.summary.totalProfit)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  총 수익
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#f8d7da',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C69' }}>
                  {results.summary.totalReturnMultiple}배
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  수익 배수
                </div>
              </div>
            </div>
          </div>

          {/* 주요 구간별 상세 정보 */}
          <div className="result-card">
            <h3 className="result-title">주요 구간별 상세 정보</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>연차</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>납입액</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>예상자산</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyProjection
                    .filter((_, index) => index % 5 === 4 || index === results.yearlyProjection.length - 1)
                    .map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'center' }}>
                        {item.year}년
                      </td>
                      <td style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                        {formatCurrencyShort(item.cumulativeInvestment)}
                      </td>
                      <td className="text-success" style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrencyShort(item.projectedAssets)}
                      </td>
                      <td className="text-success" style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                        {item.returnRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 최종 결론 메시지 */}
          <div className="highlight-box">
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#FF8C69', fontWeight: 'bold', fontSize: '1.2rem' }}>
              축하해요! 모든 계산이 완료되었어요
            </h3>
            <p style={{ margin: '0.5rem 0', color: '#3D2C2C', fontSize: '1rem' }}>
              30년간 월 {formatCurrency(monthlyAmount)} 적립 시<br/>
              <strong>{formatCurrency(results.summary.finalAssets)}</strong>의 자산을 만들 수 있어요!
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#8B6F6F', fontSize: '0.9rem' }}>
              지금 시작하면 우리 아이의 미래가 달라집니다
            </p>
          </div>

          {/* 안내 사항 */}
          <div className="info-box">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3D2C2C' }}>시뮬레이션 안내</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#3D2C2C' }}>
              <li>연 수익률 10.23%는 역사적 S&P 500 평균 기준입니다</li>
              <li>실제 투자 수익률은 시장 상황에 따라 변동될 수 있습니다</li>
              <li>복리 효과를 고려한 월 적립식 투자 기준으로 계산됩니다</li>
              <li>세금, 수수료 등은 고려되지 않았습니다</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default StepWizard;