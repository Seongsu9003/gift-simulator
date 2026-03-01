import React, { useState, useEffect } from 'react';
import { getChildren, addChild, saveSelectedChildId } from '../utils/firestore';

// 자녀 관리 컴포넌트 (자녀 목록 표시 및 새 자녀 추가)
function ChildSetup({ onChildSelected }) {
  // 자녀 목록 상태
  const [children, setChildren] = useState([]);

  // 새 자녀 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'child',
    gender: ''
  });

  // 날짜 선택 상태
  const [dateSelection, setDateSelection] = useState({
    year: '',
    month: '',
    day: ''
  });

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [addingChild, setAddingChild] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 자녀 목록 불러오기
  useEffect(() => {
    loadChildren();
  }, []);

  // 자녀 목록을 불러오는 함수
  const loadChildren = async () => {
    try {
      setLoading(true);
      const childrenList = await getChildren();
      setChildren(childrenList);

      // 자녀가 없으면 자동으로 추가 폼 표시
      if (childrenList.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('자녀 목록 로드 에러:', error);
      setError('자녀 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  // 새 자녀 추가 폼 제출 처리
  const handleAddChild = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('자녀 이름을 입력해주세요.');
      return;
    }

    if (!dateSelection.year || !dateSelection.month || !dateSelection.day) {
      setError('생년월일을 모두 선택해주세요.');
      return;
    }

    if (!formData.gender) {
      setError('자녀 성별을 선택해주세요.');
      return;
    }

    setAddingChild(true);
    setError('');

    try {
      // 생년월일 포맷팅
      const birthDate = `${dateSelection.year}-${dateSelection.month.padStart(2, '0')}-${dateSelection.day.padStart(2, '0')}`;

      // 새 자녀 데이터
      const newChildData = {
        name: formData.name.trim(),
        birthDate: birthDate,
        gender: formData.gender,
        relationship: formData.relationship
      };

      // Firestore에 자녀 추가
      const childId = await addChild(newChildData);

      // 폼 초기화
      setFormData({ name: '', relationship: 'child', gender: '' });
      setDateSelection({ year: '', month: '', day: '' });
      setShowAddForm(false);

      // 자녀 목록 새로고침
      await loadChildren();

      console.log('새 자녀 추가 완료:', childId);

    } catch (error) {
      console.error('자녀 추가 에러:', error);
      setError('자녀 정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAddingChild(false);
    }
  };

  // 자녀 선택 처리
  const handleSelectChild = (child) => {
    // 선택된 자녀 ID를 로컬 스토리지에 저장
    saveSelectedChildId(child.id);

    // 부모 컴포넌트에 선택된 자녀 정보 전달
    onChildSelected(child);
  };

  // 자녀 나이 계산 함수
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

  // 로딩 화면
  if (loading) {
    return (
      <div className="child-setup-container">
        <div className="container">
          <div className="loading-content">
            <div className="loading-icon">🌱</div>
            <p>자녀 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="child-setup-container">
      <div className="container">
        {/* 헤더 */}
        <div className="setup-header">
          <div className="setup-icon">👶💛</div>
          <h2 className="setup-title">
            {children.length === 0 ? '우리 아이 정보 입력' : '자녀 선택'}
          </h2>
          <p className="setup-subtitle">
            {children.length === 0
              ? '자녀 정보를 입력하시면 맞춤형 증여 플랜을 제공해드릴게요'
              : '증여 플랜을 확인할 자녀를 선택해주세요'
            }
          </p>
        </div>

        {/* 기존 자녀 목록 */}
        {children.length > 0 && (
          <div className="children-list">
            <h3 className="children-list-title">등록된 자녀</h3>
            <div className="children-grid">
              {children.map((child) => (
                <div key={child.id} className="child-card">
                  <div className="child-info">
                    <div className="child-header">
                      <span className="child-name">{child.name}</span>
                      <span className="child-gender">
                        {child.gender === 'male' ? '👦' : '👧'}
                      </span>
                    </div>
                    <div className="child-details">
                      <p className="child-birth">🎂 {child.birthDate}</p>
                      <p className="child-age">만 {calculateAge(child.birthDate)}세</p>
                      <p className="child-relationship">
                        {child.relationship === 'child' ? '자녀' : '손자녀'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="select-child-button"
                    onClick={() => handleSelectChild(child)}
                  >
                    선택
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 자녀 추가 버튼 */}
        {children.length > 0 && !showAddForm && (
          <div className="add-child-section">
            <button
              className="add-child-button"
              onClick={() => setShowAddForm(true)}
            >
              + 자녀 추가하기
            </button>
          </div>
        )}

        {/* 새 자녀 추가 폼 */}
        {showAddForm && (
          <div className="add-child-form">
            <h3 className="form-title">
              {children.length === 0 ? '자녀 정보 입력' : '새 자녀 추가'}
            </h3>

            <form onSubmit={handleAddChild}>
              {/* 자녀 이름 */}
              <div className="form-group">
                <label htmlFor="childName" className="form-label">
                  자녀 이름
                </label>
                <input
                  type="text"
                  id="childName"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="예: 홍길동"
                  required
                />
              </div>

              {/* 자녀 생년월일 */}
              <div className="form-group">
                <label className="form-label">
                  자녀 생년월일
                </label>
                <div className="date-picker-container">
                  <select
                    className="form-select date-select"
                    value={dateSelection.year}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    required
                  >
                    <option value="">연도</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>

                  <select
                    className="form-select date-select"
                    value={dateSelection.month}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    required
                  >
                    <option value="">월</option>
                    {monthOptions.map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>

                  <select
                    className="form-select date-select"
                    value={dateSelection.day}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    required
                    disabled={!dateSelection.year || !dateSelection.month}
                  >
                    <option value="">일</option>
                    {getDayOptions().map(day => (
                      <option key={day} value={day}>{day}일</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 자녀와의 관계 */}
              <div className="form-group">
                <label htmlFor="relationship" className="form-label">
                  자녀와의 관계
                </label>
                <select
                  id="relationship"
                  name="relationship"
                  className="form-select"
                  value={formData.relationship}
                  onChange={handleInputChange}
                >
                  <option value="child">자녀</option>
                  <option value="grandchild">손자녀</option>
                </select>
              </div>

              {/* 성별 */}
              <div className="form-group">
                <label className="form-label">
                  성별
                </label>
                <div className="gender-selector">
                  <button
                    type="button"
                    className={`gender-button ${formData.gender === 'male' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, gender: 'male'}))}
                  >
                    👦 남자아이
                  </button>
                  <button
                    type="button"
                    className={`gender-button ${formData.gender === 'female' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, gender: 'female'}))}
                  >
                    👧 여자아이
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="form-buttons">
                {children.length > 0 && (
                  <button
                    type="button"
                    className="form-button secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: '', relationship: 'child', gender: '' });
                      setDateSelection({ year: '', month: '', day: '' });
                      setError('');
                    }}
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="form-button"
                  disabled={addingChild}
                >
                  {addingChild ? '저장 중...' : (children.length === 0 ? '우리 아이 플랜 시작하기 🌱' : '자녀 추가하기')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChildSetup;