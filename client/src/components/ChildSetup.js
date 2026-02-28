import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// 자녀 정보 입력 컴포넌트
function ChildSetup({ onComplete }) {
  // 폼 상태
  const [formData, setFormData] = useState({
    childName: '',
    relationship: 'child'
  });

  // 날짜 선택 상태
  const [dateSelection, setDateSelection] = useState({
    year: '',
    month: '',
    day: ''
  });

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

      return newSelection;
    });
  };

  // 월별 날짜 수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 연도 옵션 생성 (1994~2026, 역순)
  const yearOptions = [];
  for (let year = 2026; year >= 1994; year--) {
    yearOptions.push(year);
  }

  // 월 옵션 생성
  const monthOptions = [];
  for (let month = 1; month <= 12; month++) {
    monthOptions.push(month);
  }

  // 일 옵션 생성
  const getDayOptions = () => {
    if (!dateSelection.year || !dateSelection.month) return [];

    const daysInMonth = getDaysInMonth(parseInt(dateSelection.year), parseInt(dateSelection.month));
    const dayOptions = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dayOptions.push(day);
    }
    return dayOptions;
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.childName.trim()) {
      setError('자녀 이름을 입력해주세요.');
      return;
    }

    if (!dateSelection.year || !dateSelection.month || !dateSelection.day) {
      setError('생년월일을 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('로그인이 필요합니다.');

      // 날짜 포맷팅
      const birthDate = `${dateSelection.year}-${dateSelection.month.padStart(2, '0')}-${dateSelection.day.padStart(2, '0')}`;

      // 자녀 정보를 Firestore에 저장
      const childData = {
        childName: formData.childName.trim(),
        childBirthDate: birthDate,
        relationship: formData.relationship,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...childData,
        email: user.email,
        displayName: user.displayName
      });

      console.log('자녀 정보 저장 완료:', childData);

      // 설정 완료 콜백 호출
      onComplete(childData);

    } catch (err) {
      console.error('자녀 정보 저장 에러:', err);
      setError('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"child-setup-container\">
      <div className=\"container\">
        {/* 안내 섹션 */}
        <div className=\"setup-header\">
          <div className=\"setup-icon\">👶💛</div>
          <h2 className=\"setup-title\">우리 아이 정보 입력</h2>
          <p className=\"setup-subtitle\">
            자녀 정보를 입력하시면 맞춤형 증여 플랜을 제공해드릴게요
          </p>
        </div>

        {/* 입력 폼 */}
        <div className=\"form-container\">
          <form onSubmit={handleSubmit}>
            {/* 자녀 이름 */}
            <div className=\"form-group\">
              <label htmlFor=\"childName\" className=\"form-label\">
                자녀 이름
              </label>
              <input
                type=\"text\"
                id=\"childName\"
                name=\"childName\"
                className=\"form-input\"
                value={formData.childName}
                onChange={handleInputChange}
                placeholder=\"예: 홍길동\"
                required
              />
            </div>

            {/* 자녀 생년월일 */}
            <div className=\"form-group\">
              <label className=\"form-label\">
                자녀 생년월일
              </label>
              <div className=\"date-picker-container\">
                <select
                  className=\"form-select date-select\"
                  value={dateSelection.year}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                  required
                >
                  <option value=\"\">연도</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>

                <select
                  className=\"form-select date-select\"
                  value={dateSelection.month}
                  onChange={(e) => handleDateChange('month', e.target.value)}
                  required
                >
                  <option value=\"\">월</option>
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>

                <select
                  className=\"form-select date-select\"
                  value={dateSelection.day}
                  onChange={(e) => handleDateChange('day', e.target.value)}
                  required
                  disabled={!dateSelection.year || !dateSelection.month}
                >
                  <option value=\"\">일</option>
                  {getDayOptions().map(day => (
                    <option key={day} value={day}>{day}일</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 자녀와의 관계 */}
            <div className=\"form-group\">
              <label htmlFor=\"relationship\" className=\"form-label\">
                자녀와의 관계
              </label>
              <select
                id=\"relationship\"
                name=\"relationship\"
                className=\"form-select\"
                value={formData.relationship}
                onChange={handleInputChange}
              >
                <option value=\"child\">자녀</option>
                <option value=\"grandchild\">손자녀</option>
              </select>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className=\"error\">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type=\"submit\"
              className=\"form-button\"
              disabled={loading}
            >
              {loading ? '저장 중...' : '우리 아이 플랜 시작하기 🌱'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChildSetup;