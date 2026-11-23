# Phase 3·4: 포털 통합검색형 포트폴리오 화면과 이력 데이터 구현

## Context
- **승인된 시안:** `design/prototype` (브랜치 `docs/design-prototype`)
  - 회색 바탕 위에 흰 카드를 쌓고, 오른쪽에 사이드 카드를 둡니다.
  - 전체 탭에만 인물정보 카드를 두고, 다른 탭에서는 사이드 첫 카드가 내 정보입니다.
- **지금 앱:** `/search`는 "전체" 탭에만 내용이 있고, 나머지 탭은 빈 화면입니다. 프로젝트 데이터는 2019~2020 클론 7개뿐입니다.
- **목표**
  - 탭 6개(전체 / 경력 / 기술 / 학력 / 자격·수상 / 프로젝트)를 실제 이력 자료(`/Volumes/Jexists/resume/resume`)로 채웁니다.
  - 프로젝트 상세에는 원본 `.md` 내용 대부분이 들어갑니다.
- **사용자 결정 (2026-11-23)**
  1. 헤더 윗줄(로고, 검색바와 아이콘, 공유, 앱 그리드, 아바타)은 원본 `SearchHeader` 그대로 씁니다. 세부 디자인은 나중에 따로 다듬습니다.
  2. Go 백엔드도 같이 늘려서 계약 테스트 규칙을 유지합니다.
  3. 사진은 나중에 받습니다. 그때까지는 이니셜 아바타를 쓰고, 파일만 넣으면 표시되게 `avatar` 필드를 지원합니다.
  4. Vue.js·Django(프로젝트 없음, "학습"으로 표시), 운전면허·한자 6급, 비공개 저장소 링크(plog, instpic, photo_organizer)를 모두 표시합니다.

## 관련 코드·현재 구조
- **라우트:** `front/src/app/router.tsx`. 그대로 둡니다(`/`, `/search?tab=`, `/project/:slug`).
- **검색 화면:** `front/src/features/projects/pages/SearchPage.tsx`
  - `?tab`은 `isCategory`로 검증합니다.
  - 렌더 조건이 `category === 'all'`뿐이라 나머지 탭이 빈 화면입니다.
- **탭:** `front/src/features/projects/components/CategoryTabs.tsx`. Swiper, 키보드 이동, 인디케이터를 재사용하고 탭 목록만 바꿉니다.
- **헤더:** `front/src/components/layout/SearchHeader.tsx`. 바꾸지 않고 `tabs` prop만 넘깁니다.
- **프로필:** `features/profile/{types,api(toProfile),components/ProfileCard,hooks/useProfile}`
- **프로젝트:** `features/projects/{types,api(projectMapper.toProjectMeta, projects.api),components(ProjectCard,SeriesNav),pages/ProjectDetailPage}`. 상세는 `react-markdown`으로 `body`를 렌더합니다.
- **MSW:** `front/src/mocks/handlers.ts`가 `@mockup/*.json`을 import하고, 필터와 정렬은 `queries.ts`가 합니다. 계약은 `apiContract.ts`(MSW 대상)와 `CONTRACT_API_URL`(Go 대상)입니다.
- **Go**
  - 계층: `back/internal/{model,repo,service,handler,router}`
  - 서버 조립: `back/cmd/server/main.go`
  - 시드: `back/cmd/seed`는 `mockup/*.json`을 이름 그대로 컬렉션에 넣으므로, 새 JSON 파일을 추가하면 자동으로 시드됩니다.
- **스타일:** `front/src/styles/tokens.json`을 `applyTokens`로 적용합니다. 컴포넌트 목록은 `manifest.json`이고 `manifest.test.ts`가 검사합니다.

## 범위
### 1. 데이터 계약 (mockup = 컬렉션 = API 응답)
| 컬렉션 | 변경 | 주요 필드 |
|---|---|---|
| `profiles` | 필드 추가, `kakaoId`·`keywords` 삭제 | `headline`, `summary[]`, `years`, `links[{type,label,url}]`, `strengths[{title,text}]`, `avatar?`, `nameEn`을 "Jeong, Juae"로 |
| `careers` (새) | 3건 + 기타 2건 | `order`, `company`, `companyNote?`, `period{start,end}`, `duration`, `role`, `service?`, `responsibilities[]`, `metrics[{value,label,note}]`, `achievements[{title,period,role?,work[],problems[],result?}]`, `extras[]`, `skillIds[]`, `minor?`(기타 경력) |
| `skills` (새) | 약 30건 | `order`, `name`, `group`(Frontend…Tools), `usage`(work/project/study), `context`, `projectIds[]`, `careerIds[]` |
| `educations` (새) | 대학 1 + 교육과정 5 | `kind`(degree/course), `order`, `name`, `org`, `major?`, `degree?`, `period`, `hours?`, `notes[]` |
| `credentials` (새) | 자격 6 + 수상 4 | `kind`(certificate/award), `order`, `name`, `issuer`, `date`, `note?` |
| `categories` | 의미 변경 | 프로젝트 구분: `edu` 교육 프로젝트 / `personal` 개인 프로젝트 / `archive` 2019–2020 작업 |
| `projects` | 7건 → 약 20건으로 교체 | 기존 필드 유지(`categoryId`, `tags`=기술, `series`, `featured`, `publishedAt`, `body`). 추가: `subtitle`, `course?`, `period`, `team?`, `role?`, `highlights[]`, `links[{type,label,url}]`, `images[{src,caption}]` |

- **기존 필드 처리:** `link`와 `github` 필드는 `links[]`로 바꿉니다. 클론 4개는 `series: 클론 코딩`을 유지해 SeriesNav가 계속 동작합니다.
- **레사모:** 프로젝트가 아니라 `careers`에만 넣습니다.
- **`body`:** 원본 md의 섹션을 마크다운 그대로 옮깁니다(개요 표, 기능, 관점별 내용, 사례, 기술 고민, 기여 구분, 배운 점, 개선할 점).
  - 빼는 것: "4줄 요약", "면접 예상 질문", 로컬 상대 경로 링크
  - 2019~2020 작업과 짧은 실습은 원문 분량이 적어 그대로 짧게 둡니다.
- **draft 문서:** coming-soon 2건을 지웁니다. draft 동작 자체는 코드와 단위 테스트(fixture)에 남깁니다.
- **콘텐츠 기준:** `_final` 최종본 표기를 우선합니다. 확정된 3건(성진 "웹 퍼블리싱·프론트엔드 개발", "퇴사 후", blog2shorts "4명 (2명 중도 이탈)")을 반영합니다.
- **넣지 않는 정보:** 전화번호, 주소, 생년월일, 연봉, 매출과 거래액.

### 2. Go 백엔드 (읽기 전용 목록 API 4개)
- **모델:** `model/{career,skill,education,credential}.go`를 새로 만듭니다. `profile.go`와 `project.go`에는 필드를 추가합니다. 배열 필드는 `omitempty` 없이 빈 배열로 내보냅니다.
- **반복 제거:** 같은 모양이 반복되므로 `repo/list.go`에 제네릭 `ListRepo[T]`(order 오름차순 `Find`)를 둡니다. `service`와 `handler`도 제네릭 `List[T]` 하나로 처리해, 기존 handler → service → repo 계층을 유지합니다.
- **라우트:** `GET /api/v1/{careers,skills,educations,credentials}`를 `router.go`와 `cmd/server/main.go`에 연결합니다. 컬렉션 상수는 `db`에 둡니다.
- **기존 Go 테스트:** `router_test.go`, `service/project_test.go`의 옛 카테고리 문자열을 고칩니다.

### 3. 프론트 화면
- **새 feature `front/src/features/resume/`**
  - `types`: DTO와 화면 타입
  - `api/resume.api.ts`: `listCareers`, `listSkills`, `listEducations`, `listCredentials`
  - `hooks/useResume.ts`: React Query
  - `components`: `CareerSection`, `SkillsSection`, `EducationSection`, `CredentialsSection`, 전체 탭용 결과 카드 `ResumeResultCards`
- **`profile`**
  - `ProfileCard`를 인물정보 카드로 바꿉니다: 이름, 영문명·직무, 칩 탭(탭 링크), 정보 목록, 사진 또는 이니셜. 키워드 필터와 하드코딩 날짜는 지웁니다.
  - 새 컴포넌트 `ProfileSide`(사이드 내 정보), `StrengthsCard`(핵심 역량), `LinksCard`(외부 링크 목록)를 만듭니다.
- **`projects`**
  - `ProjectCard`를 썸네일 타일로 바꿉니다. 이미지가 없으면 지금 쓰는 그라데이션과 첫 글자를 유지합니다.
  - `FeaturedRail`: 전체 탭의 가로 썸네일 목록과 넘기기 버튼
  - `ProjectList`: "더보기"로 펼치는 전체 목록. 구분 칩과 `?tag` 필터를 둡니다.
  - `RelatedQueries`: 대표 프로젝트와 실무 기술에서 "정주애 ○○" 검색어를 만듭니다. 하드코딩하지 않습니다.
  - `ProjectDetailPage`
    - 구성: 히어로 카드(`< 프로젝트`, 제목, 부제, 요약, 기술, 대표 이미지), 본문 카드(markdown), 사이드(개요, 링크 버튼, 다른 대표 프로젝트), SeriesNav
    - 이미지가 없으면 갤러리를 숨깁니다. 외부 링크는 새 탭과 `rel="noopener noreferrer"`로 엽니다.
- **`SearchPage`:** `?tab` ∈ all|career|skills|education|certs|projects이고, 모르는 값이면 all로 보냅니다. 왼쪽 열과 오른쪽 사이드의 2열이고, 탭마다 위 컴포넌트를 조합합니다.
- **`CategoryTabs`:** 탭 목록을 새 6개로 바꾸고, 타입을 `SearchTab`으로, aria-label을 "검색 탭"으로 바꿉니다.
- **인트로**
  - 디자인은 원본을 유지합니다.
  - 키보드 함정을 고칩니다: 전역 keydown이 아무 키에나 skip하던 것을 Enter와 Escape에서만 하게 하고, 포커스가 들어오면 자동 이동을 멈춥니다.
  - 바로가기와 추천어 문구를 새 탭에 맞추고, 실제 `/search?tab=` 링크로 바꿉니다.
- **마크다운:** 표 렌더용으로 `remark-gfm`을 추가합니다. 원본 md에 표가 많습니다.
- **스타일:** 시안의 레이아웃 치수(사이드 폭 22rem, 카드 간격, 2열 전환 기준 860px)를 `tokens.json`의 `search.*`에 추가합니다. 새 컴포넌트는 `manifest.json`에 등록합니다.

### 4. 문서
- `docs/PRD.md`: AC-L1과 스키마 예시를 새 AC로 바꿉니다.
- `docs/ARCHITECTURE.md`: 컬렉션 표와 API 표를 갱신합니다.
- `docs/DECISIONS.md`: 탭은 고정 UI, categories는 프로젝트 구분, 이력 컬렉션 분리, 제네릭 목록 API, remark-gfm 결정을 기록합니다.
- `docs/PROGRESS.md`

## 제외 범위
- 프로젝트 캡처와 이미지(Phase 5): `images[]`는 비워 두고 자리만 둡니다.
- 사진 파일: 사용자가 주면 `front/public/images/profile.jpg`와 `avatar` 값만 넣습니다.
- 헤더 윗줄과 인트로의 디자인 변경
- 관리자와 쓰기 API
- 직무 렌즈
- 다국어

## 단계 (TDD: 각 단계에서 실패하는 테스트를 먼저 씁니다)
0. **준비**
   - `docs/design-prototype`에 `.claude/launch.json`(시안 미리보기)을 커밋합니다.
   - PR을 만들고, 사용자 승인 후 merge합니다.
   - `refactor/category-ids`는 이 계획으로 대체되므로 merge하지 않고 브랜치만 남깁니다.
   - 그다음 `dev-start`로 Issue와 브랜치를 만듭니다.
1. **계약:** `apiContract.ts`에 새 계약을 추가하고 기존 계약을 고칩니다. 그다음 mockup JSON 4개를 만들고, profiles·projects·categories를 고치고, MSW handlers를 추가합니다. MSW 대상으로 통과시킵니다.
2. **Go:** 모델, 제네릭 list 계층, 라우트를 만들고 `make test`와 `make lint`를 통과시킵니다. 로컬 Mongo에 `make seed`와 `make run`을 한 뒤 `CONTRACT_API_URL`로 같은 계약을 통과시킵니다.
3. **프론트 데이터:** resume feature의 api와 hooks, profile·project 타입과 mapper를 만듭니다. 단위 테스트를 씁니다.
4. **화면:** CategoryTabs, SearchPage 탭별 렌더링, 인물정보·사이드 카드, 탭 섹션 4개, 프로젝트 타일·레일·목록 순서로 진행합니다. 컴포넌트 테스트를 씁니다.
5. **프로젝트 상세:** remark-gfm, 레이아웃, 링크 버튼을 만듭니다.
6. **인트로:** 키보드 수정과 문구·링크 갱신
7. **마무리:** 토큰과 manifest, 문서 갱신

## 영향 파일 (대표)
- **mockup:** `mockup/{profiles,projects,categories}.json`, 새로 `mockup/{careers,skills,educations,credentials}.json`
- **back:** `back/internal/model/*`, `back/internal/repo/list.go`, `back/internal/{service,handler}/list.go`, `back/internal/router/router.go`, `back/internal/db/*`, `back/cmd/server/main.go`, 관련 `_test.go`
- **front**
  - `front/src/features/resume/**` (새로 만듦)
  - `front/src/features/profile/**`
  - `front/src/features/projects/**`
  - `front/src/features/intro/**`
  - `front/src/mocks/{handlers,apiContract,apiContract.test}.ts`
  - `front/src/styles/{tokens,manifest}.json`
  - `front/package.json` (remark-gfm)
  - `front/scripts/generate-feeds*.ts` (link 필드 변경에 맞춤)
- **docs:** `docs/{PRD,ARCHITECTURE,DECISIONS,PROGRESS}.md`

## 위험·호환성
- **옛 링크:** `?tab=publishing` 같은 옛 링크는 전체 탭으로 갑니다. 지금도 같은 동작입니다.
- **피드:** `feed.xml`과 `sitemap.xml`의 프로젝트 목록이 바뀝니다. 슬러그가 새로 정해지기 때문입니다.
- **draft 문서 삭제:** `includeDrafts` 계약은 "기본 목록에 draft 없음"과 "includeDrafts 목록 ⊇ 기본 목록"으로 고칩니다.
- **비공개 저장소 링크:** 사용자 요청대로 표시합니다. 다만 공개로 바꾸기 전에는 방문자에게 404가 납니다.
- **번들:** 현재 약 620kB에서 remark-gfm만큼 늘어납니다. 라우트 분할은 이번 범위 밖이고 PROGRESS에 남깁니다.

## 테스트
- 계약(MSW와 Go 모두)
  - profile 새 필드
  - careers·skills·educations·credentials 목록과 order 정렬
  - 프로젝트 category 필터(`edu`), tag 필터, featured 우선 정렬
  - 목록에 body 없음, 상세에 body 있음
- 컴포넌트
  - 탭 6개가 각각 렌더되고, 모르는 tab은 전체로 갑니다.
  - 전체 탭에만 인물정보 카드가 있습니다.
  - 다른 탭은 사이드에 내 정보가 있습니다.
  - 프로젝트 "더보기"와 구분 필터가 동작합니다.
  - 상세에서 링크가 새 탭으로 열리고 rel이 붙습니다. 표가 렌더되고, 빈 필드는 숨겨집니다.
  - 인트로에서 Tab 키로 이동하지 않고, Enter로 이동합니다.
- **명령:** `cd front && npm test && npm run lint && npm run build`, `cd back && make test && make lint`, 그리고 `CONTRACT_API_URL=http://localhost:8080/api/v1 npm test -- apiContract`
- **수동:** `npm run dev`(MSW)를 브라우저 패널에서 열어, 탭 6개, 상세 2~3개, 모바일 390px, 키보드 이동을 시안과 비교합니다.

## Acceptance Criteria
- AC-IA1: 탭 6개(전체/경력/기술/학력/자격·수상/프로젝트)에 모두 내용이 있습니다. 모르는 `tab` 값은 전체로 갑니다.
- AC-IA2: 전체 탭은 인물정보 카드, 대표 프로젝트 레일, 경력·기술·학력 결과 카드, 사이드(핵심 역량, 관련 검색어, 링크)를 보여 줍니다. 나머지 탭은 사이드 첫 카드가 내 정보입니다.
- AC-IA3: 경력은 회사별 기간, 역할, 수치(출처 주석 포함), 업무·문제 해결·성과, 기술을 보여 줍니다. 레사모는 프로젝트 목록에 없습니다.
- AC-IA4: 기술은 숙련도 수치 없이 실무/프로젝트/학습 구분, 활용 맥락, 관련 프로젝트·경력 링크로 보여 줍니다.
- AC-IA5: 프로젝트 탭은 대표작 카드를 먼저 보여 주고, "더보기"로 전체 목록과 구분 필터를 펼칩니다. 상세는 원본 md 내용(요약과 면접 질문 제외)을 보여 주고, 실제 링크만 새 탭으로 엽니다.
- AC-IA6: 헤더 윗줄은 기존 SearchHeader와 같습니다.
- AC-IA7: MSW와 Go API가 같은 계약 테스트를 통과합니다.
- AC-IA8: 인트로에서 키보드 Tab 이동이 페이지 이동을 일으키지 않습니다.

## Workflow
- type: feat
- issue: new
- title: feat: 통합검색형 포트폴리오 화면과 이력 데이터 구현
- slug: portal-redesign
