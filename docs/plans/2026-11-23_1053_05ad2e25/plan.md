# 포트폴리오 리디자인 — Phase 1 분석 결과와 Phase 2 디자인 시안 계획

> **이번 승인 범위는 Phase 2(디자인 시안)까지입니다.** 시안은 `design/prototype/`에 정적 HTML로 만들고, 앱 코드(front/back/mockup)는 건드리지 않습니다. 시안을 보여 드린 뒤 멈추고 승인을 기다립니다. Phase 3~7은 시안이 승인되면 계획을 따로 세웁니다.

## Context
- **현재 상태:** 지금 포트폴리오는 Google 홈을 그대로 따라 한 인트로, 네이버 인물정보식 프로필 카드, 대시보드 카드 그리드가 섞여 있습니다. 탭 6개 중 "전체"만 동작하고 나머지는 빈 화면입니다.
- **목표:** 검색 UX를 진입점으로 살리고, 내부는 전문적인 커리어 아카이브로 정리합니다. 탭은 6개(전체 / 경력 / 기술 / 학력 / 자격·수상 / 프로젝트)입니다.
- **콘텐츠 원본:** `/Volumes/Jexists/resume/resume`의 실제 자료만 씁니다.

---

## Phase 1 분석 결과 요약

### 1~2. 저장소와 로컬 상태
- 로컬 `/Volumes/Jexists/resume/portfolio`가 `origin https://github.com/jexists/portfolio.git`과 연결돼 있습니다. `main`은 origin과 같고(ahead/behind 0), 최근 커밋은 `8bfa5b7`(#7)입니다. **작업 기준은 로컬입니다.**
- **커밋되지 않은 변경 12개 파일:** 카테고리 id를 resume/publishing/design/study에서 career/project/skills/education으로 바꾸는 작업입니다. 사용자 작업이므로 이번 시안 단계에서는 손대지 않고, 커밋에도 넣지 않습니다.
- **`docs/wireframe` 브랜치(미머지):** 와이어프레임 v1·v2와 이전 개편 계획(직무 렌즈 포함)이 있습니다. 직무 렌즈는 이번에 빼기로 했습니다.

### 3~6. 구조, 스택, 기존 UI와 기능
- **front:** Vite 7, React 19, TS, react-router 7, React Query, axios, MSW 2, SCSS Modules, Swiper. 토큰은 `front/src/styles/tokens.json`을 `applyTokens.ts`가 CSS 변수로 넣습니다. 글꼴은 Pretendard입니다.
- **라우트:** `/`(인트로), `/search?tab=&tag=`, `/project/:slug`, `/login`, `/admin`. 정의는 `front/src/app/router.tsx`에 있습니다.
- **back:** Go/Gin, `/api/v1/{profile,categories,projects,tags,series}`. 인증은 자리만 있습니다.
- **mockup:** profiles 1건, categories 5건, projects 7건(클론과 실습 위주, 썸네일과 링크 없음).
- **배포:** GitHub Pages(`/portfolio/`, MSW 목업). CI는 front lint/test/build와 back lint/test/build를 돌립니다.
- **Playwright는 설치돼 있지 않습니다.**

### 7. 개선해야 할 부분
1. 전체를 뺀 탭 5개가 빈 화면입니다(`SearchPage.tsx`에서 `category === 'all'`일 때만 렌더링).
2. 인트로가 전역 keydown으로 skip해서 Tab 키 이동까지 막힙니다. role="main"이 중복이고, main에 onClick이 붙어 있습니다.
3. Google을 그대로 복제한 가짜 컨트롤이 있습니다(마이크, 카메라, AI 모드, I'm Feeling Lucky, 앱 그리드).
4. 필터가 둘입니다(ProfileCard 키워드와 태그 칩). heading 위계가 어긋나고(h1, h2, h2), 상세에서 돌아가는 길이 없습니다(X 누르면 인트로가 다시 재생됨).
5. 반응형 기준이 48rem 하나뿐이고 인트로에는 반응형 처리가 없습니다. 포커스 스타일이 대부분 없습니다.
6. 콘텐츠가 컴포넌트에 하드코딩돼 있습니다(이메일, GitHub URL, 추천어, 날짜).
7. `tokens.json`에 컴포넌트 치수가 섞여 비대합니다. PROGRESS.md, PRD, ARCHITECTURE의 카테고리 정보가 오래됐습니다.

### 8~10. 이력서 자료 분석과 콘텐츠 구조
- **공개 가능:** 이름, 직무(웹 풀스택 개발자, 5년 차), 한 줄 소개, 서울(관악구), 이메일, GitHub, LinkedIn, 블로그, 웹사이트.
- **공개 제외:** 전화번호, 상세 주소, 생년월일, 연봉, 초·중학교 기록, 팀원 실명, 거래액과 매출.
- **경력**
  - 브레이스(레사모, 2020.08–2026.04, 업무 영역 13개, 문제 해결 사례 14개, 커밋 7,130개). **레사모는 프로젝트가 아니라 경력 탭에서 보여 줍니다.**
  - 성진에이치디에스(2020.02–04)
  - 뉴스게이트(2016.05–2019.05, 편집디자인)
  - 기타(1Q CCTV, DCP OJT)
- **기술:** `기술.md`의 분류(주요 실무, 기타 실무, 프로젝트 경험, AI 활용, 디자인, 기타)를 그대로 쓰고 관련 프로젝트와 연결합니다. 퍼센트 숙련도는 표시하지 않습니다.
- **학력:** University of Santo Tomas BFA Industrial Design(2012–2016)을 씁니다. 교육과정 5개는 학력 탭의 "교육" 구역에 둡니다.
- **자격 6개, 수상 5개:** 증빙 파일은 국가기술자격증 PDF 하나뿐입니다. 이 PDF에는 개인정보가 있어 링크하지 않습니다.
- **프로젝트(레사모 제외)**
  - 교육 프로젝트 10개: 한빛수학, Testory, snapbook, 흙의 온도, travel-content-maker, SalesLuv, 전·월세, 튜브어때, 전기차 SOS, blog2shorts
  - 개인 바이브 코딩 3개(저장소 비공개, 링크 숨김)
  - 2019~2020 작업 11개: 포트폴리오 2019, 코카-콜라, 클론 4개, 실습 5개
  - 이미 있는 배포, GitHub, 발표 URL은 자료에 적힌 그대로 씁니다.
- **이미지:** 프로젝트 스크린샷은 자료에 한 장도 없습니다. Phase 5에서 Playwright로 실제 URL을 캡처합니다.

### 자료 간 차이 (사용자 질문: "충돌되는 내용이 없을 텐데?")
에이전트가 찾은 15건은 대부분 충돌이 아닙니다. CLAUDE.md에 이미 결정이 적혀 있는 의도적 표기 차이입니다. 분류하면 다음과 같습니다.

**확인이 필요한 3건** (포트폴리오에서 어느 표기를 쓸지)
1. **성진에이치디에스 역할명:** `경력/경력.md`는 "웹 퍼블리싱·프론트엔드 개발", `_final/이력서`는 "UI 퍼블리싱·프론트엔드 개발"입니다.
2. **"퇴사 후 6개월간 AI 부트캠프"(`_final/자기소개서`):** SKN30 시작일은 2026.03.27이고 재직 기록은 2026.04.01까지라서 며칠 겹칩니다. 포트폴리오에서는 날짜만 쓰면 문제가 없습니다.
3. **blog2shorts 팀 이탈 표현:** `프로젝트/README.md`는 "2명 중도 이탈", `2026_미니인턴.md`는 "1명 초반 이탈, 1명 발표 전날 이탈"입니다. 인원 수는 같습니다.

**표기 차이일 뿐 문제없는 것**
- GWA 1.761과 1.76(반올림)
- 조직 규모 "2–5인"과 "5인 이하"
- 검색 기간: 검색 전체(2021.05~)와 Atlas Search(2025.08~)는 범위가 다릅니다.
- 웹디자인기능사와 웹디자인개발기능사(현재 종목명)

**CLAUDE.md에 결정이 있는 것**
- 레사모(구 4mation)
- Atlas Search 담당 표기
- AX Campus "수료 예정" 삭제
- 택배사 API 표기
- Testory level01/level03
- Vue.js·Django 유지
- "5년 차"
- LinkedIn 링크

**기준:** 포트폴리오는 `_final` 최종본 표기를 따르고, 최종본에 없는 항목만 md 원본을 씁니다.

**확인 필요 3건, 사용자 결정 (2026-11-23)**
1. 성진에이치디에스 역할명은 "웹 퍼블리싱·프론트엔드 개발"로 씁니다.
2. "퇴사 후 AI 부트캠프" 표현을 그대로 씁니다. 겹치는 기간은 남은 휴가 기간입니다.
3. blog2shorts는 "4명 (2명 중도 이탈)"로 씁니다.

### 11~13. 디자인 컨셉, 레이아웃, 탭
- **컨셉:** "검색으로 들어가는 커리어 아카이브"
  - 첫 화면만 검색 UX(로고, 검색창, 타이핑, 추천어)로 둡니다. Google 고유 요소(I'm Feeling Lucky, AI 모드, 마이크, 카메라, 앱 그리드)는 뺍니다.
  - 안쪽 페이지는 상단에 검색바 헤더와 탭만 두고, 본문은 에디토리얼 문서처럼 구성합니다.
- **색과 글꼴**
  - 바탕은 흰색, 텍스트는 짙은 회색, 테두리는 회색 계열입니다. 강조색은 링크와 활성 탭용 하나만 씁니다.
  - 로고 4색은 첫 화면 로고에만 남깁니다.
  - 그림자와 그라데이션은 쓰지 않거나 최소로 씁니다. 글꼴은 Pretendard를 유지합니다.
- **레이아웃**
  - 데스크톱은 본문 최대 약 72rem입니다. 전체 탭은 2열(본문 + 오른쪽 프로필 패널)이고, 나머지 탭은 1열 문서형입니다.
  - 모바일(390px)은 1열입니다. 탭은 가로 스크롤하고, 프로필 패널은 맨 위로 올립니다.
- **탭별 화면**
  - **전체:** 프로필 요약, 경력 요약, 핵심 기술, 대표 프로젝트 3~4개, 학력·자격 요약. 각 구역에 "경력 전체 보기 →" 같은 링크를 둡니다.
  - **경력:** 회사별 세로 타임라인입니다. 브레이스는 서비스 소개, 기여 수치, 업무 영역(접기·펼치기), 문제 해결 사례 중 대표 몇 개, 기술 순서로 보여 줍니다.
  - **기술:** 카테고리별 목록입니다. 기술마다 활용 맥락 한 줄과 관련 프로젝트, 경력 링크를 둡니다.
  - **학력:** 학력(대학)과 교육과정 두 구역입니다.
  - **자격·수상:** 자격과 수상 두 표입니다(날짜, 이름, 발급기관).
  - **프로젝트:** 처음에는 대표 프로젝트만 이미지 카드로 보여 줍니다. "프로젝트 더보기"를 누르면 나머지가 펼쳐지고, 구분 필터(교육, 개인, 2019~2020 작업)를 둡니다.
  - **프로젝트 상세:** 대표 이미지, 개요(기간, 역할, 팀, 기술), 링크 버튼(Live, GitHub, 발표 자료, 문서, 새 탭 + `rel="noopener noreferrer"`), 문제와 해결, 주요 기능, 성과, 추가 이미지 갤러리, 이전/다음 프로젝트 순서입니다. 값이 없는 필드는 숨깁니다.

### 14~15. 데이터 구조와 향후 ERD 방향 (Phase 4에서 구현)
- **원칙 유지:** "mockup = 컬렉션 = API 계약"을 그대로 따릅니다. 탭이 늘어난 만큼 컬렉션을 추가합니다.
  - 기존: `profiles`(links[] 추가), `projects`(roles, team, period, images[], links[], skillIds[], careerId 추가)
  - 신규: `careers`(achievements[], skillIds[]), `skills`, `educations`, `certificates`, `awards`
- **API:** 각 컬렉션마다 GET 목록 API를 둡니다. Go는 기존 handler → service → repo 패턴을 그대로 복제합니다. front 타입과 mapper는 features별로 둡니다.
- **ERD 방향(문서만):** Profile 1–N ExternalLink, Career 1–N CareerAchievement, Project 1–N ProjectImage/ProjectLink/ProjectDocument, Project N–M Skill(ProjectSkill), Career N–M Skill(CareerSkill), Project N–1 Career. 지금은 id 배열로 관계를 표현하고 DB 정규화는 하지 않습니다.
- **미정:** 백엔드 Go API까지 함께 늘릴지(계약 테스트를 유지하려면 필요), 프론트와 mockup만 할지는 Phase 4 계획에서 정합니다.

### 16. 프로젝트 캡처 계획 (Phase 5)
- **설치:** front devDependency로 `@playwright/test`를 추가합니다. 캡처 스크립트는 `front/scripts/capture.ts` 하나로 만듭니다.
- **대상:** 자료에 적힌 공개 URL만 캡처합니다(한빛수학 웹·어드민, Testory, snapbook, 흙의 온도, 발표 HTML, 2019~2020 GitHub Pages).
  - 로그인이 필요한 화면은 공개 영역만 캡처합니다.
  - 종료된 배포(SalesLuv)와 PC 의존 서비스(blog2shorts)는 접속 확인만 하고, 안 열리면 이미지 없이 둡니다.
- **저장:** `front/public/images/projects/<slug>/{cover,01,02…}.png`에 둡니다. 캡처 결과는 `docs/plans/.../capture-log.md`에 기록합니다.

### 17. 구현 계획 (승인 후 단계별 별도 계획)
| 단계 | 내용 |
|---|---|
| Phase 3 | UI 구현. 인트로 정리, `SearchPage` 탭별 렌더링, 탭 컴포넌트, 상세 페이지 |
| Phase 4 | 데이터 계약과 컬렉션 확장, 콘텐츠 입력 |
| Phase 5 | 캡처와 링크 |
| Phase 6 | 검증. 빌드, tsc, vitest, 계약 테스트, Playwright 스모크, 모바일과 접근성 |
| Phase 7 | 정리. PROGRESS, DECISIONS, ARCHITECTURE, PRD 갱신 |

---

## Phase 2: 디자인 시안 (이번 작업)

### 범위
- **파일:** `design/prototype/index.html`과 `style.css`, `app.js`, `data.js`.
  - HTML, CSS, 바닐라 JS만 씁니다. 외부 의존성은 Pretendard CDN 하나입니다.
  - 해시 라우팅(`#/`, `#/search?tab=…`, `#/project/<slug>`)을 씁니다. 더블클릭으로 바로 열립니다.
- **콘텐츠 분리:** 콘텐츠는 `data.js` 하나에만 둡니다. 객체 모양은 Phase 4 데이터 구조 초안을 따릅니다(Profile, Career, Skill, Education, Certificate, Award, Project + images[], links[]).
- **화면 9개**
  1. 검색 첫 화면: 타이핑 후 자동 진행, 클릭이나 Enter로 skip. Tab 키는 skip하지 않습니다.
  2. 전체
  3. 경력
  4. 기술
  5. 학력
  6. 자격·수상
  7. 프로젝트 목록: 대표 4개를 이미지 카드로 보여 주고, "더보기"로 나머지 목록과 구분 필터를 펼칩니다.
  8. 프로젝트 상세
  9. 모바일: 상단 "데스크톱 / 모바일(390px)" 전환 버튼으로 같은 화면을 좁은 프레임에서 봅니다.
- **샘플 상세는 2개만 완성합니다:** 한빛수학(링크와 발표 자료가 많은 경우), blog2shorts(팀 프로젝트이고 링크가 적은 경우). 다른 프로젝트 카드는 목록에만 나오고, 누르면 "같은 템플릿으로 채워질 예정"이라는 안내가 뜹니다.
- **이미지:** 실제 캡처가 없으므로 회색 자리 표시 상자에 "캡처 예정 (Phase 5)"라고 적습니다. 임의로 만든 스크린샷은 쓰지 않습니다.
- **콘텐츠는 실제 자료만 씁니다.** 전화번호, 주소, 생년월일, 연봉, 매출은 넣지 않습니다. 비공개 저장소 링크(plog, instpic, photo_organizer)는 숨깁니다.

### 제외 범위
- front, back, mockup 코드 수정
- 미커밋 카테고리 변경 처리
- Playwright 설치와 캡처
- 직무 렌즈
- 프로젝트 상세 22개 전부 작성

### 단계
1. `dev-start`로 브랜치를 만듭니다(issue 없음). 미커밋 변경은 그대로 두고, 이후 커밋에는 `design/prototype/` 파일만 지정해 넣습니다.
2. `data.js`에 자료를 구조화합니다(프로필, 경력 4건, 기술, 학력, 교육, 자격, 수상, 프로젝트 목록, 상세 2건).
3. `style.css`에 디자인 토큰(:root 변수)과 레이아웃, 컴포넌트를 만듭니다.
4. `app.js`로 해시 라우팅과 화면 렌더링, 모바일 전환을 구현합니다.
5. 브라우저 패널에서 9개 화면을 데스크톱과 모바일로 직접 열어 스크린샷으로 확인하고 수정합니다.
6. 보고: 화면별 스크린샷과 디자인 결정 요약, 확인 필요 3건을 정리합니다. **여기서 멈추고 승인을 기다립니다.**

### 영향 파일
- 새로 만드는 파일: `design/prototype/{index.html,style.css,app.js,data.js}`
- 기존 파일 변경: 없음

### 위험
- 시안의 HTML/CSS는 React로 옮길 때 다시 작성해야 합니다. 그 대신 토큰 값과 레이아웃 치수는 그대로 `tokens.json`에 옮길 수 있습니다.
- `design/` 폴더는 "코드가 읽지 않는 시안 폴더"라는 규칙에 맞으므로 CI와 배포에 영향이 없습니다.

### 검증
- `npx serve design/prototype` 대신 `file://`로 엽니다. 필요하면 `python3 -m http.server`로 브라우저 패널에서 엽니다.
- 탭 6개, 더보기, 상세 2개, 링크(새 탭), 모바일 전환, 키보드 Tab 이동을 직접 눌러 확인합니다.
- 콘솔 오류가 없어야 합니다.

### Acceptance Criteria
- 화면 9개를 모두 브라우저에서 열어 볼 수 있습니다.
- 모든 텍스트가 `/Volumes/Jexists/resume/resume` 자료에 근거하고, 민감 정보가 없습니다.
- 숙련도 퍼센트가 없고, 기술마다 관련 프로젝트나 경력이 연결돼 있습니다.
- 레사모는 경력 탭에 있고 프로젝트 목록에는 없습니다.
- 프로젝트 탭은 처음에 대표작만 보여 주고, "더보기"로 전체가 펼쳐집니다.
- 390px에서 가로 스크롤이 생기지 않습니다(탭 바 제외).

## Workflow
- type: docs
- issue: none
- title: docs: 포트폴리오 리디자인 디자인 시안 추가
- slug: design-prototype
