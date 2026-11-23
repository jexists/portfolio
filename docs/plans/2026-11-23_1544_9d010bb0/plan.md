# 검색결과 화면 다듬기 (사용자 피드백 10건)

## Context
통합검색형 리디자인(Issue #10, PR #11) merge 후 사용자가 화면을 보고 10가지를 요청했다.
목표: 헤더·본문 정렬을 맞추고, 인물정보 카드를 간결하게, 학력 탭을 "한눈에 보기 + 타임라인 + 교육 카드"로, `이력서` 탭을 새로 둔다.
사용자 확인 사항: 학력 더보기에 **초등학교까지 공개**(이전 계획의 "초·중학교 비공개"를 뒤집음 → DECISIONS에 기록), 새 탭 이름은 **`이력서`**.

## 관련 코드·현재 구조
- 레이아웃: `front/src/features/projects/pages/SearchPage.tsx`·`.module.scss`, `components/layout/SearchHeader.tsx`·`.module.scss`, 토큰 `styles/tokens.json`(`--search-*`)
- 탭: `features/projects/components/CategoryTabs.tsx`(`searchTabs`, `SearchTab`)
- 인물정보: `features/profile/components/ProfileCard.tsx`(ProfileCard·FactList·StrengthsCard)
- 요약 계산: `features/resume/utils/profileFacts.ts`(`buildProfileFacts`)
- 학력·이력: `features/resume/components/ResumeSections.tsx`(`EducationSection` 등)
- 대표 프로젝트: `features/projects/components/ProjectCollections.tsx`(`FeaturedRail`)
- 데이터: `mockup/educations.json`, `mockup/credentials.json` / Go `back/internal/model/resume.go` / 계약 `front/src/mocks/apiContract.ts`

## 범위 (요청 번호별)
1. **정렬**: 본문 카드 왼쪽·오른쪽 끝을 헤더 검색창·탭과 맞춘다. 원인: 헤더 그리드는 `content-offset` 바로 다음에 검색창이 오는데 `.shell`은 `column-gap: space-6`이 더해져 24px 밀림 → `.shell` 첫 열을 `calc(offset - space-6)`로 보정.
2. **인물정보 카드의 칩 탭 삭제**: `ProfileCard`의 `tabs`·`activeTab` prop과 `.chips` 스타일 제거.
3. **작은 화면 헤더(≤48rem)**: 왼쪽 PortFolio 로고를 숨기고, 검색창 안 맨 앞에 색깔 `P` 마크(첫페이지 링크)를 보인다. 검색창 + 오른쪽 액션을 한 줄로.
4. **전체 경력 요약 = 브레이스·뉴스게이트**: `buildProfileFacts`가 `!minor && responsibilities.length > 0`(상세 기록이 있는 주요 경력)만 고른다 → 3개월짜리 성진이 빠진다. 계약 변경 없음.
5. **자격 요약 = 웹디자인기능사·운전면허**: `credentials.json`에서 운전면허 order를 2로 올리고(PCSQL·PCCE 등 한 칸씩 뒤로) 요약 개수를 2개로. 전체 탭 학력·자격 결과 카드도 같은 2개.
6. **이메일 복사 버튼 → 아이콘**: "복사" 글자 대신 복사 아이콘 버튼(복사 후 체크 아이콘), `aria-label` 유지.
7. **핵심역량 디자인 변경**: 아코디언 목록. 각 줄 = 번호 원형 배지 + 제목 + 펼침 화살표, 클릭하면 그 줄 아래 설명이 열린다(한 번에 하나, 첫 줄 기본 열림). 이동하는 링크는 없음. `button aria-expanded` + `aria-controls`.
8. **대표 프로젝트 `›` 버튼**: 레일 스크롤이 끝에 닿으면 버튼을 숨긴다(scroll 이벤트로 `scrollLeft + clientWidth >= scrollWidth - 1` 판정).
9. **학력 탭 재구성** (6번째 사진의 구성만, 색·내용은 기존 토큰·데이터):
   - 맨 위 "학력·교육 한눈에 보기" 가로 타임라인(과거→현재, 학교·교육 노드, 최고학력 강조, 작은 화면에선 가로 스크롤)
   - "학력 N건" 세로 타임라인 카드, 기본 **최신순**, 최신순/과거순 토글, 최고학력·졸업 배지. 기본은 대학·고등학교, **더보기**로 중학교·초등학교까지 펼침
   - "교육 N건" 카드 목록(아이콘 + 과정명·기관·시간, 오른쪽에 기간), 최신순/과거순 토글
   - 데이터: `educations.json`에 `kind: "school"` 문서 추가 — 군산산북초(입학·전학), 군산미성초(졸업), 군산산북중(필리핀 유학으로 중단), 필리핀 고교(Saint Claire Fountain of Knowledge 외 2개교, 졸업·개근상). 출처 `resume/학력_교육/학력.md`
10. **`이력서` 탭**: 탭 순서 `전체 · 이력서 · 경력 · 기술 · 학력 · 자격·수상 · 프로젝트`. 인물정보 카드 맨 아래 `이력서 보기 →` 줄(7번째 사진의 "인물정보 더보기 →" 형태)로 이동. 내용은 기존 데이터로 만든 한 장짜리 이력서 문서: 이름·직무·연락처/링크, 요약, 경력(주요 경력 + 역할), 기술(실무), 학력(학위), 교육, 자격·수상. 사이드는 다른 탭처럼 `ProfileSide`.

## 제외 범위
- 이력서 인쇄·PDF 다운로드 버튼, 레일의 이전(`‹`) 버튼, 프로필 사진 교체
- 백엔드 API 경로 추가 없음(이력서 탭은 기존 4개 컬렉션 조합)

## 단계
1. dev-start → Issue·브랜치
2. 데이터: `educations.json`(school 4건), `credentials.json`(order) → Go `resume.go` kind 주석 `degree | course | school`, 프론트 `Education.kind`에 `'school'` 추가, 계약 테스트의 kind 집합 갱신. `make seed` 후 Go 계약 통과 확인
3. 테스트 먼저(실패 확인) → 구현: 1·3 레이아웃 → 2·6·7 인물정보 → 4·5 요약 → 8 레일 → 9 학력 → 10 이력서 탭
4. 브라우저로 데스크톱·모바일 폭 확인, 스크린샷 공유

## 영향 파일
- front: `SearchPage.tsx/.scss`, `SearchHeader.tsx/.scss`, `CategoryTabs.tsx`, `ProfileCard.tsx/.scss`, `profileFacts.ts`, `ResumeSections.tsx/.scss`(EducationSection·ResumeResultCards), 새 `ResumeDocument.tsx/.scss`(resume feature, index export), `ProjectCollections.tsx/.scss`, `resume.types.ts`, `apiContract.ts`, `tokens.json`(필요한 크기 토큰)
- mockup: `educations.json`, `credentials.json`
- back: `internal/model/resume.go`(주석만)
- docs: `DECISIONS.md`(초·중학교 공개로 변경), `PROGRESS.md`

## 위험·호환성
- `kind: 'school'` 추가로 기존 `kind === 'degree'` 필터는 그대로 동작(최고학력 = UST 유지). 계약 테스트 기대값만 바꾼다.
- `ProfileCard` prop 제거 → 호출처는 `SearchPage` 한 곳.
- 탭 추가로 `CategoryTabs` 키보드 이동·인디케이터 테스트 갱신.
- 공개 정보 확대(초·중학교 이름) — 사용자 확인 완료.

## 테스트
- `profileFacts.test.ts`: 경력 = 브레이스·뉴스게이트, 자격 = 웹디자인기능사·운전면허
- `ProfileCard.test.tsx`: 칩 탭 없음, 복사 아이콘 버튼 동작, `이력서 보기` 링크 `/search?tab=resume`, 핵심역량 아코디언 펼침/접힘
- `CategoryTabs.test.tsx`: `이력서`가 두 번째 탭
- 새 `ProjectCollections.test.tsx`: 끝까지 스크롤하면 `다음 프로젝트` 버튼 숨김
- 새 `ResumeSections.test.tsx`: 학력 기본 최신순·초등학교 숨김 → 더보기로 표시, 과거순 토글, 교육 카드 N건, 한눈에 보기 노드
- `SearchPage.test.tsx`: `?tab=resume`에서 이력서 문서 렌더
- `SearchHeader.test.tsx`: 검색창 안 `P` 마크 링크 존재
- `apiContract.test.ts`(MSW) + Go 계약, `npm run lint`·`build`, `make test`

## Acceptance Criteria
- 데스크톱에서 검색창·탭·본문 카드의 왼쪽/오른쪽 끝이 맞는다
- 인물정보 카드에 칩 탭이 없고, 경력 2줄은 브레이스·뉴스게이트, 자격은 웹디자인기능사·운전면허, 이메일 복사는 아이콘
- 48rem 이하에서 PortFolio 로고 대신 검색창 안에 `P`가 보인다
- 핵심역량은 클릭으로 설명이 펼쳐진다
- 대표 프로젝트 레일 끝에서 `›`가 사라진다
- 학력 탭: 한눈에 보기 → 학력(최신순 기본, 더보기로 초등학교까지) → 교육 카드
- `이력서` 탭이 전체 옆에 있고, 인물정보 카드 `이력서 보기 →`로 이동한다
- 프론트 테스트·린트·빌드, Go 테스트, 계약 테스트 통과

## Workflow
- type: feat
- issue: new
- title: feat: 검색결과 화면 정렬·인물정보·학력 개선과 이력서 탭 추가
- slug: search-refine
