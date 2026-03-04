import React, { useState, useEffect } from 'react';
import { getChildren, addChild, updateChild, deleteChild, saveSelectedChildId } from '../utils/firestore';

// 자녀 관리 컴포넌트 (자녀 목록 표시, 새 자녀 추가, 수정, 삭제)
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

  // 수정 중인 자녀 상태 (null이면 수정 모드 아님, child 객체면 수정 모드)
  const [editingChild, setEditingChild] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    relationship: 'child',
    gender: ''
  });
  const [editDateSelection, setEditDateSelection] = useState({
    year: '',
    month: '',
    day: ''
  });
  const [updatingChild, setUpdatingChild] = useState(false);

  // 삭제 확인 모달 상태 (null이면 닫힘, child 객체면 해당 자녀 삭제 확인 중)
  const [deleteConfirmChild, setDeleteConfirmChild] = useState(null);
  const [deletingChild, setDeletingChild] = useState(false);

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

  // 입력값 변경 처리 (추가 폼)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 입력값 변경 처리 (수정 폼)
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 날짜 선택 처리 (추가 폼)
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

  // 날짜 선택 처리 (수정 폼)
  const handleEditDateChange = (field, value) => {
    setEditDateSelection(prev => {
      const newSelection = { ...prev, [field]: value };

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

  // 일 옵션 생성 (추가 폼용)
  const getDayOptions = () => {
    if (!dateSelection.year || !dateSelection.month) return [];
    const daysInMonth = getDaysInMonth(parseInt(dateSelection.year), parseInt(dateSelection.month));
    const dayOptions = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dayOptions.push(day);
    }
    return dayOptions;
  };

  // 일 옵션 생성 (수정 폼용)
  const getEditDayOptions = () => {
    if (!editDateSelection.year || !editDateSelection.month) return [];
    const daysInMonth = getDaysInMonth(parseInt(editDateSelection.year), parseInt(editDateSelection.month));
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

  // 수정 버튼 클릭 시 — 기존 자녀 정보를 폼에 미리 채우기
  const handleEditClick = (child) => {
    // 수정 모드 진입 전에 다른 UI 닫기
    setShowAddForm(false);
    setDeleteConfirmChild(null);
    setError('');

    // 날짜 파싱 (YYYY-MM-DD → year, month, day)
    const [year, month, day] = child.birthDate.split('-');

    setEditingChild(child);
    setEditFormData({
      name: child.name,
      relationship: child.relationship || 'child',
      gender: child.gender || ''
    });
    setEditDateSelection({
      year: year || '',
      month: String(parseInt(month)) || '',  // "01" → "1"
      day: String(parseInt(day)) || ''        // "05" → "5"
    });
  };

  // 수정 폼 취소
  const handleEditCancel = () => {
    setEditingChild(null);
    setEditFormData({ name: '', relationship: 'child', gender: '' });
    setEditDateSelection({ year: '', month: '', day: '' });
    setError('');
  };

  // 수정 폼 제출 처리
  const handleUpdateChild = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!editFormData.name.trim()) {
      setError('자녀 이름을 입력해주세요.');
      return;
    }

    if (!editDateSelection.year || !editDateSelection.month || !editDateSelection.day) {
      setError('생년월일을 모두 선택해주세요.');
      return;
    }

    if (!editFormData.gender) {
      setError('자녀 성별을 선택해주세요.');
      return;
    }

    setUpdatingChild(true);
    setError('');

    try {
      // 생년월일 포맷팅
      const birthDate = `${editDateSelection.year}-${editDateSelection.month.padStart(2, '0')}-${editDateSelection.day.padStart(2, '0')}`;

      const updateData = {
        name: editFormData.name.trim(),
        birthDate: birthDate,
        gender: editFormData.gender,
        relationship: editFormData.relationship
      };

      // Firestore 업데이트
      await updateChild(editingChild.id, updateData);

      // 수정 모드 종료
      setEditingChild(null);
      setEditFormData({ name: '', relationship: 'child', gender: '' });
      setEditDateSelection({ year: '', month: '', day: '' });

      // 자녀 목록 새로고침
      await loadChildren();

      console.log('자녀 정보 수정 완료:', editingChild.id);

    } catch (error) {
      console.error('자녀 수정 에러:', error);
      setError('자녀 정보 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUpdatingChild(false);
    }
  };

  // 삭제 버튼 클릭 시 — 확인 모달 표시
  const handleDeleteClick = (child) => {
    setShowAddForm(false);
    setEditingChild(null);
    setError('');
    setDeleteConfirmChild(child);
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setDeleteConfirmChild(null);
  };

  // 삭제 확인 후 실행
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmChild) return;

    setDeletingChild(true);
    setError('');

    try {
      await deleteChild(deleteConfirmChild.id);

      setDeleteConfirmChild(null);

      // 자녀 목록 새로고침
      await loadChildren();

      console.log('자녀 삭제 완료:', deleteConfirmChild.id);

    } catch (error) {
      console.error('자녀 삭제 에러:', error);
      setError('자녀 삭제에 실패했습니다. 다시 시도해주세요.');
      setDeleteConfirmChild(null);
    } finally {
      setDeletingChild(false);
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
            <div className="loading-icon"></div>
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
          <div className="setup-icon"></div>
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

        {/* 삭제 확인 모달 */}
        {deleteConfirmChild && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 0.75rem 0', color: '#3D2C2C', fontSize: '1.2rem' }}>
                자녀 정보 삭제
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: '1.6' }}>
                <strong style={{ color: '#3D2C2C' }}>{deleteConfirmChild.name}</strong> 님의 정보를 삭제하시겠어요?
                <br />
                삭제된 정보는 복구할 수 없습니다.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingChild}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e0e0e0',
                    background: '#fff',
                    color: '#666',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingChild}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#dc3545',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: deletingChild ? 'not-allowed' : 'pointer',
                    opacity: deletingChild ? 0.7 : 1,
                    fontFamily: 'inherit'
                  }}
                >
                  {deletingChild ? '삭제 중...' : '삭제하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 기존 자녀 목록 */}
        {children.length > 0 && (
          <div className="children-list">
            <h3 className="children-list-title">등록된 자녀</h3>
            <div className="children-grid">
              {children.map((child) => (
                <div key={child.id}>
                  {/* 수정 모드가 아닌 경우 — 일반 카드 */}
                  {editingChild?.id !== child.id ? (
                    <div className="child-card">
                      <div className="child-info">
                        <div className="child-header">
                          <span className="child-name">{child.name}</span>
                          <span className="child-gender">
                            {child.gender === 'male' ? 'M' : 'F'}
                          </span>
                        </div>
                        <div className="child-details">
                          <p className="child-birth">{child.birthDate}</p>
                          <p className="child-age">만 {calculateAge(child.birthDate)}세</p>
                          <p className="child-relationship">
                            {child.relationship === 'child' ? '자녀' : '손자녀'}
                          </p>
                        </div>
                      </div>
                      {/* 버튼 영역: 선택 / 수정 / 삭제 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          className="select-child-button"
                          onClick={() => handleSelectChild(child)}
                        >
                          선택
                        </button>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditClick(child)}
                            style={{
                              flex: 1,
                              padding: '0.45rem 0',
                              borderRadius: '10px',
                              border: '1.5px solid #FF8C69',
                              background: '#FFF5F3',
                              color: '#FF8C69',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteClick(child)}
                            style={{
                              flex: 1,
                              padding: '0.45rem 0',
                              borderRadius: '10px',
                              border: '1.5px solid #e0e0e0',
                              background: '#fff',
                              color: '#999',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 수정 모드 — 인라인 편집 폼 */
                    <div className="add-child-form" style={{ marginBottom: '1rem' }}>
                      <h3 className="form-title">자녀 정보 수정</h3>

                      <form onSubmit={handleUpdateChild}>
                        {/* 자녀 이름 */}
                        <div className="form-group">
                          <label className="form-label">자녀 이름</label>
                          <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={editFormData.name}
                            onChange={handleEditInputChange}
                            placeholder="예: 홍길동"
                            required
                          />
                        </div>

                        {/* 자녀 생년월일 */}
                        <div className="form-group">
                          <label className="form-label">자녀 생년월일</label>
                          <div className="date-picker-container">
                            <select
                              className="form-select date-select"
                              value={editDateSelection.year}
                              onChange={(e) => handleEditDateChange('year', e.target.value)}
                              required
                            >
                              <option value="">연도</option>
                              {yearOptions.map(year => (
                                <option key={year} value={year}>{year}년</option>
                              ))}
                            </select>

                            <select
                              className="form-select date-select"
                              value={editDateSelection.month}
                              onChange={(e) => handleEditDateChange('month', e.target.value)}
                              required
                            >
                              <option value="">월</option>
                              {monthOptions.map(month => (
                                <option key={month} value={month}>{month}월</option>
                              ))}
                            </select>

                            <select
                              className="form-select date-select"
                              value={editDateSelection.day}
                              onChange={(e) => handleEditDateChange('day', e.target.value)}
                              required
                              disabled={!editDateSelection.year || !editDateSelection.month}
                            >
                              <option value="">일</option>
                              {getEditDayOptions().map(day => (
                                <option key={day} value={day}>{day}일</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 관계 */}
                        <div className="form-group">
                          <label className="form-label">관계</label>
                          <select
                            name="relationship"
                            className="form-select"
                            value={editFormData.relationship}
                            onChange={handleEditInputChange}
                          >
                            <option value="child">자녀</option>
                            <option value="grandchild">손자녀</option>
                          </select>
                        </div>

                        {/* 성별 */}
                        <div className="form-group">
                          <label className="form-label">성별</label>
                          <div className="gender-selector">
                            <button
                              type="button"
                              className={`gender-button ${editFormData.gender === 'male' ? 'selected' : ''}`}
                              onClick={() => setEditFormData(prev => ({...prev, gender: 'male'}))}
                            >
                              남자아이
                            </button>
                            <button
                              type="button"
                              className={`gender-button ${editFormData.gender === 'female' ? 'selected' : ''}`}
                              onClick={() => setEditFormData(prev => ({...prev, gender: 'female'}))}
                            >
                              여자아이
                            </button>
                          </div>
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                          <div className="error">{error}</div>
                        )}

                        {/* 버튼 영역 */}
                        <div className="form-buttons">
                          <button
                            type="button"
                            className="form-button secondary"
                            onClick={handleEditCancel}
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="form-button"
                            disabled={updatingChild}
                          >
                            {updatingChild ? '저장 중...' : '수정 완료'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 자녀 추가 버튼 */}
        {children.length > 0 && !showAddForm && !editingChild && (
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
                  관계
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
                    남자아이
                  </button>
                  <button
                    type="button"
                    className={`gender-button ${formData.gender === 'female' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, gender: 'female'}))}
                  >
                    여자아이
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
                  {addingChild ? '저장 중...' : (children.length === 0 ? '우리 아이 플랜 시작하기' : '자녀 추가하기')}
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
