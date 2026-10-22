package service

// 인증 서비스 자리.
// 기존 PRD 기준은 Kakao/GitHub 소셜 로그인(가입 = 로그인, 비밀번호 없음)이다.
// 방식이 확정되면 docs/DECISIONS.md 에 기록한 뒤 OAuth 콜백 처리와 토큰 발급을 여기에 구현하고,
// repo.UserRepo 를 UserStore interface 로 받는다.
