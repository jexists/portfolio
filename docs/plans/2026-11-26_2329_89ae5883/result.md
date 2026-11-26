# 구현 결과 — 2026-11-26_2329_89ae5883
작성: 2026-11-26 · 기준 커밋: f9c6ecb..155492d (이전 계획 2026-11-26_2304_b15f67f1 포함)

## 1. 변경 파일
`front/src/styles/tokens.json`, `front/src/styles/global.scss`, `Markdown`·`AdminPage`·`LoginPage`·`ProfileCard`·`ProjectCard`·`ProjectCollections`·`ProjectDetailPage`·`ResumeDocument`·`ResumeSections`·`CareerDetailPage`의 `*.module.scss` (총 12개).

## 2. 주요 변경 이유
- 제목 line-height가 1.0 / 상속 1.6 / 1.3으로 갈라져 있어 `heading`(1.3) 토큰으로 통일했다.
- 한글이 단어 중간에서 끊겨 body에 `word-break: keep-all`을 적용했다.
- 불릿·카드 설명에서 줄 사이와 항목 사이 간격이 같아 위계(이어지는 줄 < 항목 사이 < 제목→본문)로 정리했다. 본문 1.5, 카드 텍스트 `compact` 1.3.
- 기술 탭 모바일 가로 넘침(540px→375px), 학교명 줄간격 불일치를 수정했다.

## 3. 테스트·빌드 결과
- `npm run lint`: 통과
- `npm test`: 34 files, 152 tests 통과
- `npm run build`: 통과
- 브라우저(PC 1280px·모바일 375px)로 프로젝트 목록·상세, 경력, 학력, 기술, 이력서, 경력기술서, 인트로, 로그인을 확인했다. `/admin`은 로그인이 필요해 확인하지 못했다.

## 4. 계획 대비 달라진 부분
- 토큰 추가·제목 통일·줄바꿈: 완료
- 간격 위계 정리(두 번째 계획): 완료. 이후 요청으로 `compact` 토큰과 본문 1.5 감소를 추가했다(변경).
- `/admin` 시각 확인: 미실행(로그인 필요)
- 자격·수상 탭 캡처, 모바일 전체 목록 재확인: 미실행

## 5. 관련 커밋
- 155492d design(front): 제목·본문·항목 줄간격 위계 통일
- 32d0b0e docs(ai): 타이포그래피 개선 승인 계획 보관
