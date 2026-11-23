# 구현 결과 — 2026-11-23_1544_9d010bb0
작성: 2026-11-23 · 기준 커밋: 71af962..43f9ecb

## 1. 변경 파일
41개 파일, +2234 / −286 (`git diff --stat 71af962`).

- 데이터·계약: `mockup/{careers,credentials,educations,profiles}.json`, `back/internal/model/resume.go`, `front/src/features/resume/types/resume.types.ts`, `front/src/mocks/apiContract.ts`
- 레이아웃: `front/src/components/layout/SearchHeader.*`, `front/src/features/projects/pages/{SearchPage,ProjectDetailPage}.module.scss`, `SearchPage.styles.test.ts`, `front/src/styles/tokens.json`
- 인물정보: `front/src/features/profile/components/ProfileCard.*`, `profile/index.ts`, `front/src/features/resume/utils/profileFacts.*`
- 레일: `front/src/hooks/useRail.ts`(신규), `front/src/features/projects/components/ProjectCollections.*`
- 학력·이력서: `front/src/features/resume/components/ResumeSections.*`, `ResumeDocument.*`(신규), `resume/index.ts`, `projects/components/CategoryTabs.*`, `projects/pages/SearchPage.{tsx,test.tsx}`, `styles/manifest.json`
- 문서·설정: `docs/{DECISIONS,PROGRESS}.md`, `docs/plans/2026-11-23_1544_9d010bb0/`, `.claude/launch.json`

## 2. 주요 변경 이유
- 사용자 피드백 10건(정렬, 칩 탭, 모바일 로고, 경력·자격 요약, 이메일 아이콘, 핵심역량, 레일 버튼, 학력 탭, 이력서)을 반영한다.
- 승인 후 같은 세션에서 화면을 보며 받은 추가 피드백도 반영했다: 이력서는 탭이 아닌 "이력서 보기"로만 진입하고 v16 원본(전화·사진 제외)을 그대로 보여 줌, 인물정보 요약을 항목마다 한 줄로, 학력 학년별 표시, 교육학습.md 전체 반영과 교육→프로젝트 연결.
- 요약 문구·교육 구분·프로젝트 연결은 화면에서 문자열을 자르지 않도록 데이터 필드(`summaryLine`, `featured`, `projectIds`)로 두었다(mockup = API 계약 원칙).

## 3. 테스트·빌드 결과
- `npx vitest run` (front): Test Files 31 passed, Tests 135 passed
- `npm run lint` (front): 오류·경고 0
- `npm run build` (front): 성공 (`built in 3.37s`)
- `make test` (back): cmd/seed, internal/router, internal/service ok
- `make lint` (back, `go vet ./...`): 출력 없음(통과)
- `make build` (back): 성공
- 계약 검사 `CONTRACT_API_URL=http://localhost:8089/api/v1 npx vitest run src/mocks/apiContract.test.ts`: 12 passed (MSW·Go 둘 다, 로컬 mongod DB `portfolio_contract` 시드 후)

## 4. 계획 대비 달라진 부분
- 1 정렬: 완료. 같은 원인이던 프로젝트 상세 화면 정렬도 함께 수정.
- 2 칩 탭 삭제: 완료.
- 3 작은 화면 P 마크: 변경 — 검색창과 액션을 한 줄에 두면 검색어가 가려져, 액션을 윗줄·검색창을 아랫줄로 두었다.
- 4 경력 요약: 변경 — 규칙(`responsibilities` 있는 주요 경력)은 계획대로, 문구는 한 줄에 맞추려고 `careers.summaryLine` 추가. 사이드 카드에서는 기간 숨김.
- 5 자격 요약: 완료(credentials order 변경, 2개).
- 6 이메일 복사 아이콘: 완료.
- 7 핵심역량 아코디언: 변경 — 처음엔 모두 닫힘(사용자 요청), 문구 정리.
- 8 레일 버튼: 변경 — 끝에서 숨김 + 이전 버튼 추가, 세로 가운데, `useRail` 훅으로 분리.
- 9 학력 탭: 변경 — 한눈에 보기는 만든 뒤 사용자 요청으로 주석 처리(`buildGlance` 유지). 최신순/과거순·건수 대신 최신순 고정. 고등학교 학년별 분리와 지역·학년 표시. 교육은 중요/전체 대신 교육 과정/학습 모임·온라인/기타, 화살표로 내용·관련 프로젝트 펼침. 교육학습.md 전체(11건) 반영.
- 10 이력서: 변경 — 탭으로 만든 뒤 사용자 요청으로 탭에서 빼고 "이력서 보기"로만 진입, 내용은 이력 데이터 조합 대신 v16 원본(전화·사진 제외)을 옮긴 고정 컴포넌트, 사이드 숨김.
- 제외 범위(인쇄·PDF, 사진 교체, 새 API): 그대로 미실행.

## 5. 관련 커밋
- d56e172 feat(mockup): 학력·교육·경력 데이터와 계약 확장
- f3e47db design(front): 검색창·본문 정렬과 작은 화면 P 마크
- b3ec137 feat(front/profile): 인물정보 카드·핵심역량 개선
- 2514195 feat(front/projects): 대표 프로젝트 레일 이전·다음 버튼
- 972b935 feat(front/resume): 학력 탭 재구성과 이력서 화면 추가
- 43f9ecb docs: 검색 화면 다듬기 결정·진행·계획 기록
