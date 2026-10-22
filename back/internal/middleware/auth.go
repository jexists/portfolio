package middleware

// 인증 검사 미들웨어 자리.
// 토큰 방식이 정해지면 요청의 사용자를 확인하는 RequireAuth 와
// 관리자(/admin 통계)만 통과시키는 RequireAdmin 을 여기에 구현한다.
