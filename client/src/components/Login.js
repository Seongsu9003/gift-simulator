import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// 로그인 컴포넌트
function Login() {
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Firebase Google 로그인 팝업 실행
      const result = await signInWithPopup(auth, googleProvider);
      console.log('로그인 성공:', result.user);
    } catch (err) {
      console.error('로그인 에러:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"login-container\">
      {/* 로그인 카드 */}
      <div className=\"login-card\">
        <div className=\"login-content\">
          <div className=\"login-icon\">👶💛👨‍👩‍👧‍👦</div>

          <h2 className=\"login-title\">시작하기</h2>
          <p className=\"login-subtitle\">
            Google 계정으로 로그인하고<br />
            우리 아이만의 증여 플랜을 만들어보세요
          </p>

          {/* Google 로그인 버튼 */}
          <button
            className=\"google-login-button\"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>로그인 중...</span>
            ) : (
              <>
                <svg className=\"google-icon\" viewBox=\"0 0 24 24\">
                  <path fill=\"#4285F4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/>
                  <path fill=\"#34A853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/>
                  <path fill=\"#FBBC05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"/>
                  <path fill=\"#EA4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"/>
                </svg>
                Google로 시작하기
              </>
            )}
          </button>

          {/* 에러 메시지 */}
          {error && (
            <div className=\"login-error\">
              {error}
            </div>
          )}

          {/* 안내 문구 */}
          <div className=\"login-notice\">
            <p>🔒 개인정보는 안전하게 보호됩니다</p>
            <p>로그인 후 자녀 정보를 입력하면 맞춤형 증여 플랜을 제공해드려요</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;