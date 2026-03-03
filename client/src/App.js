import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';
import Login from './components/Login';
import ChildSetup from './components/ChildSetup';
import StepWizard from './components/StepWizard';
import { getChildren, migrateOldChildData, getSelectedChildId } from './utils/firestore';

function App() {
  // 사용자 인증 상태
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState(null); // 현재 선택된 자녀 정보
  const [needsChildSetup, setNeedsChildSetup] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // 사용자가 로그인된 경우 자녀 정보 확인
        try {
          // 1. 먼저 기존 데이터 마이그레이션 시도
          await migrateOldChildData();

          // 2. 자녀 목록 조회
          const children = await getChildren();

          if (children.length === 0) {
            // 자녀가 없는 경우 - 자녀 설정 화면으로
            setNeedsChildSetup(true);
            setChildInfo(null);
          } else {
            // 자녀가 있는 경우 - 선택된 자녀 또는 첫 번째 자녀 설정
            const selectedChildId = getSelectedChildId();
            let selectedChild = children.find(child => child.id === selectedChildId);

            if (!selectedChild) {
              // 선택된 자녀가 없거나 찾을 수 없으면 첫 번째 자녀 선택
              selectedChild = children[0];
            }

            setChildInfo(selectedChild);
            setNeedsChildSetup(false);
          }
        } catch (error) {
          console.error('사용자 정보 로드 에러:', error);
          setNeedsChildSetup(true);
        }
      } else {
        // 로그아웃된 경우 상태 초기화
        setChildInfo(null);
        setNeedsChildSetup(false);
        setShowChildSelector(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 자녀 설정 완료 처리 (자녀 선택 또는 추가 완료)
  const handleChildSetupComplete = (childData) => {
    setChildInfo(childData);
    setNeedsChildSetup(false);
    setShowChildSelector(false);
  };

  // 자녀 전환 버튼 클릭 처리
  const handleChildSwitcher = () => {
    setShowChildSelector(true);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 상태 초기화
      setUser(null);
      setChildInfo(null);
      setNeedsChildSetup(false);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">🌱</div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="landing-page">
        <div className="landing-container">
          {/* 왼쪽 히어로 영역 */}
          <div className="hero-section">
            {/* 배경 영상 - MP4로 변환하여 용량 최적화 (12MB→900KB) */}
            <video
              className="hero-bg-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={`${process.env.PUBLIC_URL}/hero-baby.mp4`} type="video/mp4" />
            </video>
            {/* 반투명 오버레이 */}
            <div className="hero-overlay"></div>

            <div className="hero-content">
              {/* 메인 카피 */}
              <h1 className="hero-title">우리 아이가 서른 살이 되면</h1>
              <p className="hero-subtitle">
                지금 시작하는 증여 한 번이<br />
                아이의 30년을 바꿉니다
              </p>

              {/* 핵심 가치 뱃지 */}
              <div className="hero-badges">
                <div className="hero-badge">📊 10년 단위 면세 활용</div>
                <div className="hero-badge">📈 복리 효과 자산 증식</div>
                <div className="hero-badge">🎯 30년 플랜 자동 생성</div>
              </div>
            </div>
          </div>

          {/* 오른쪽 로그인 영역 */}
          <div className="login-section">
            <div className="login-content">
              <Login />
            </div>
          </div>
        </div>

        {/* 푸터 (모바일에서만 표시) */}
        <footer className="landing-footer">
          <div className="footer-content">
            <p className="footer-disclaimer">
              ⚠️ 본 시뮬레이션 결과는 참고용이며, 실제 세무 신고 및 투자 결과와 다를 수 있습니다.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // 자녀 정보 입력이 필요한 경우 또는 자녀 선택 모드
  if (needsChildSetup || showChildSelector) {
    return (
      <div className="app">
        <ChildSetup onChildSelected={handleChildSetupComplete} />
      </div>
    );
  }

  return (
    <div className="app">
      {/* 자녀 전환 헤더 */}
      <header className="app-header">
        <div className="container">
          <div className="header-top">
            <div className="child-switcher-section">
              <button className="child-switcher-button" onClick={handleChildSwitcher}>
                <span className="child-name">{childInfo?.name}</span>
                <span className="child-emoji">{childInfo?.gender === 'male' ? '👦' : '👧'}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              <h1 className="child-title">
                {childInfo?.name}이의 증여 플랜 💛
              </h1>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 스텝 위자드 */}
      <StepWizard childInfo={childInfo} />

      {/* 푸터 */}
      <footer className="app-footer">
        <div className="container">
          <p className="footer-disclaimer">
            ⚠️ 본 시뮬레이션 결과는 참고용이며, 실제 세무 신고 및 투자 결과와 다를 수 있습니다.
          </p>
          <p className="footer-copyright">
            © 2026 증여 시뮬레이터. Made with ❤️ for financial planning.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
