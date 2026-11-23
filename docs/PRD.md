# PRD — Portfolio (정주애 포트폴리오)

> 2026-10-22: `jexists/portfolio_2026`(정적 마크다운 + Supabase 계획)에서 이 저장소(React + Go/Gin + MongoDB)로 옮기며 데이터·백엔드 관련 항목(§1, §3.7, §4, §7)을 고쳤다. 화면 요구사항(AC)은 그대로다.

> 이 문서는 제품 요구사항의 단일 진실 공급원(SSOT)이다.
> 모든 기능은 이 문서의 **수용 기준(AC)** 을 근거로 TDD(테스트 먼저) 방식으로 구현한다.

---

## 1. 제품 개요와 목적

**"검색엔진에서 정주애를 검색한다"** 는 컨셉의 개인 포트폴리오 사이트.

- **인트로**: 구글 검색 첫화면 패러디 — 로고 등장 → "정주애를" 자동 타이핑 → 자동완성 → 자동 클릭 → 검색 로딩
- **메인**: 네이버 인물검색 결과를 모던 클린 서치 스타일로 재해석 — 인물정보 카드 + 프로젝트 그리드
- **상세**: 프로젝트 마크다운 문서 렌더링

### 목적
1. 웹디자이너·퍼블리셔 정주애의 개인 브랜드/구직용 쇼케이스
2. **목업 JSON 기반으로 시작** (`mockup/*.json` = Mongo 컬렉션 시드 = API 계약) → Go API + MongoDB로 전환
3. 아래 확장을 처음부터 구조적으로 지원:
   - **DB/CMS 전환** (Go API + MongoDB: 로그인 후 사이트 내 편집)
   - **검색** (클라이언트 전문검색 → 서버 검색)
   - **디자인 교체** (디자인 토큰 + 컴포넌트 manifest 기반 테마 스왑)
   - **AI 기반 디자인 개선 워크플로**

### 비목표 (현 단계)
- 댓글, 방문자 통계, 다국어(한국어 UI 고정), SSR/SEO 최적화(정적 sitemap/RSS로 대체)

---

## 2. 핵심 사용자와 사용자 시나리오

| 사용자 | 시나리오 |
|---|---|
| **채용담당자 / 클라이언트** | 링크 접속 → 인트로 연출 관람(또는 스킵) → 검색결과에서 인물정보 확인 → 이메일 원클릭 복사 → 프로젝트 카드 탐색 → 상세에서 결과물·링크 확인 |
| **방문 개발자 / 디자이너** | 태그·카테고리로 관심 프로젝트 필터 → 시리즈(연재) 순서대로 열람 → RSS 구독으로 새 프로젝트 알림 |
| **운영자 (정주애 본인)** | (현재) `mockup/projects.json` 수정 → `make seed` 또는 배포 (향후 API로 직접 편집) (향후) Kakao/GitHub 로그인 → 사이트 내에서 프로필·프로젝트 직접 편집. 관리자 대시보드에서 방문 통계 확인 |
| **로그인 방문자** | 아바타 클릭 → Kakao/GitHub 소셜 로그인(가입=로그인) → 첫 로그인 시 방문 목적 설문 1회 → (향후) 프로젝트 즐겨찾기·방명록 |

### 시나리오별 수용 기준
- **AC-U1**: 인트로는 사용자 조작 없이 끝까지 진행되어 검색결과로 이동한다. 클릭·Enter·Escape 시 즉시 스킵된다.
- **AC-IA8**: 인트로에서 키보드 Tab 이동은 페이지 이동을 일으키지 않고, 포커스가 들어오면 자동 이동을 멈춘다.
- **AC-U2**: 이메일 복사 버튼 클릭 시 클립보드에 이메일이 복사되고 시각적 피드백이 표시된다.
- **AC-U3**: `prefers-reduced-motion` 사용자는 애니메이션 없이 콘텐츠를 볼 수 있다.
- **AC-U4**: 첫 로그인 사용자에게 방문 목적 설문(채용 담당자/개발자/학생/둘러보기)을 1회만 보여주고 저장한다. 이미 답한 사용자에게 다시 묻지 않는다.
- **AC-U5**: 방문·로그인·목적·제공자 데이터는 StatsService 추상화 뒤에 저장되며(현재 localStorage mock, 향후 Go API의 users·visits 컬렉션), 관리자만 `/admin` 대시보드에서 전체 방문 수·로그인 사용자 수·목적 비율·제공자 비율·최근 방문 목록을 볼 수 있다.

---

## 3. 콘텐츠 요구사항 — 프로젝트 목록·상세, 태그, 시리즈, RSS, sitemap

콘텐츠 단위는 **프로젝트**다. (블로그 글 없음 — 시리즈는 프로젝트 연재 묶음, RSS는 새 프로젝트 발행 피드)

### 3.1 프로젝트 목록 (`/search`)
- **US-L1**: 방문자로서 프로젝트를 카테고리 탭으로 필터해 보고 싶다.
  - **AC-IA1** (AC-L1 대체, 2026-11-23): 탭은 전체/경력/기술/학력/자격·수상/프로젝트이고 모두 내용이 있다. 모르는 `tab` 값은 전체로 간다.
  - **AC-IA2**: 전체 탭은 인물정보 카드, 대표 프로젝트 레일, 경력·기술·학력 결과 카드, 사이드(핵심 역량·관련 검색어·링크)를 보여 준다. 나머지 탭은 사이드 첫 카드가 내 정보다.
  - **AC-IA3**: 경력은 회사별 기간·역할·수치(출처 주석)·업무·문제 해결·성과·기술을 보여 준다. 회사 업무(레사모)는 프로젝트 목록에 넣지 않는다.
  - **AC-IA4**: 기술은 숙련도 수치 없이 실무/프로젝트/학습 구분, 활용 맥락, 관련 프로젝트·경력 링크로 보여 준다.
  - **AC-IA5**: 프로젝트 탭은 대표작 카드를 먼저 보여 주고 "더보기"로 전체 목록과 구분 필터를 펼친다. 상세는 원본 프로젝트 문서(요약·면접 질문 제외)를 보여 주고 실제 링크만 새 탭(`rel="noopener noreferrer"`)으로 연다. 값이 없는 필드는 숨긴다.
  - **AC-IA6**: 헤더 윗줄은 기존 SearchHeader 와 같다. **AC-IA7**: MSW와 Go API가 같은 계약 테스트를 통과한다.
  - **AC-L2**: `draft: true` 프로젝트는 "준비중" placeholder 카드로만 표시되고 상세로 이동할 수 없다.
  - **AC-L3**: 카드에는 썸네일(없으면 제목 첫 글자), 제목·부제, 구분·기간·팀이 표시되고, 프로젝트 탭에서는 요약·성과·기술 태그도 표시된다.
  - **AC-L4**: 목록은 `featured` 우선, 그다음 `publishedAt` 내림차순으로 정렬된다.

### 3.2 프로젝트 상세 (`/project/:slug`)
- **US-D1**: 방문자로서 프로젝트의 상세 내용(마크다운)을 읽고 싶다.
  - **AC-D1**: 프로젝트 문서의 `body`(마크다운)가 HTML로 렌더링된다.
  - **AC-D2**: 라이브 링크(`link`)·GitHub 링크(`github`)가 있으면 버튼으로 노출된다.
  - **AC-D3**: 존재하지 않는 slug 접근 시 404 안내와 목록 복귀 링크가 표시된다.

### 3.3 태그
- **US-T1**: 방문자로서 태그로 관련 프로젝트를 모아 보고 싶다.
  - **AC-T1**: 태그 칩 클릭 시 해당 태그를 가진 프로젝트만 필터된다 ("전체" 탭에서 동작).
  - **AC-T2**: `listTags()`는 draft 제외 전체 프로젝트의 태그를 중복 없이 반환한다.

### 3.4 시리즈
- **US-S1**: 방문자로서 연재 프로젝트를 순서대로 보고 싶다.
  - **AC-S1**: 같은 `series` 값을 가진 프로젝트는 `seriesOrder` 순으로 묶인다.
  - **AC-S2**: 시리즈 소속 프로젝트 상세에는 시리즈명과 이전/다음 내비게이션이 표시된다.

### 3.5 RSS
- **AC-R1**: 빌드 시 `dist/feed.xml` (RSS 2.0)이 생성된다.
- **AC-R2**: 피드에는 draft 제외 프로젝트가 `publishedAt` 내림차순으로 포함된다 (title, link, description, pubDate, guid).

### 3.6 sitemap
- **AC-M1**: 빌드 시 `dist/sitemap.xml` 이 생성된다.
- **AC-M2**: 정적 라우트(`/`, `/search`)와 draft 제외 모든 프로젝트 상세 URL이 포함된다.

### 3.7 콘텐츠 스키마 (mockup = Mongo 컬렉션)

파일 1개 = 컬렉션 1개(JSON 배열). 전체 필드 표는 `docs/ARCHITECTURE.md`.

```jsonc
// mockup/projects.json 의 문서 1개
{
  "_id": "hanbit-math",                  // slug, 필수
  "title": "한빛수학", "subtitle": "학원 수강 신청·출결 관리 서비스",
  "categoryId": "edu",                   // 필수: edu|personal|archive (categories 컬렉션 = 프로젝트 구분)
  "kind": "교육", "course": "AX Campus 3회차 · …",
  "period": { "start": "2026.11.02", "end": "2026.11.06" },
  "summary": "한 줄 소개",               // 필수
  "tags": ["Next.js", "NestJS"],         // 기술
  "team": "1명", "role": "DB 설계, QA, 발표",
  "highlights": ["20테이블 ERD"],
  "links": [{ "type": "live", "label": "코어 웹", "url": "https://..." }],   // live|github|slides|video|doc|pdf
  "linkNote": "",                        // 링크 주의 문구 (배포 종료 등)
  "images": [],                          // [{ src, caption }], 첫 장이 대표 이미지
  "series": { "name": "클론 코딩", "order": 1 },   // 선택
  "publishedAt": "2026-11-06",           // 필수 (정렬 기준)
  "featured": true, "draft": false,
  "body": "## 프로젝트 개요\n..."        // 원본 프로젝트 문서 마크다운 (목록 응답에서는 제외)
}
```

`mockup/profiles.json`: _id, name, nameEn, role, years, location, email, avatar, headline, summary[], links[], strengths[].
이력 컬렉션: `careers`, `skills`, `educations`, `credentials` (필드는 `docs/ARCHITECTURE.md`).
그 밖의 컬렉션: `categories`(프로젝트 구분 라벨·순서), `users`(소셜 로그인 사용자·방문 목적), `visits`(방문 기록).

---

## 4. API 계약과 데이터 소스 전환

UI는 데이터 출처를 모른다. 화면은 `features/*/hooks`(React Query)를 쓰고, 훅은 `features/*/api/*.api.ts`(axios)로 `/api/v1`을 호출한다.

| 메서드 | 경로 | 응답 |
|---|---|---|
| GET | `/api/v1/profile` | 프로필 문서 |
| GET | `/api/v1/projects?category=&tag=&includeDrafts=true` | 프로젝트 문서 배열 (body 제외, featured 우선 → publishedAt 내림차순) |
| GET | `/api/v1/projects/:slug` | 프로젝트 문서 (body 포함), 없으면 404 |
| GET | `/api/v1/tags` | 공개 프로젝트 태그 (중복 없음, 한국어 순) |
| GET | `/api/v1/series` | `{ name, order, projects[] }[]` |
| GET | `/api/v1/categories` | 카테고리 문서 배열 (order 순) |

- **AC-C1**: 컴포넌트는 axios를 직접 부르지 않고 feature의 hook/api만 사용한다.
- **AC-C2**: 백엔드가 없을 때 MSW가 `mockup/*.json`으로 같은 경로를 응답한다 (`front/src/mocks`).
- **AC-C3**: 계약 테스트(`front/src/mocks/apiContract.ts`)를 MSW와 Go API가 모두 통과한다.
- **교체 조건**: MSW → Go API 전환 시 `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` 설정 외 UI 코드 수정이 없어야 한다.

---

## 5. 디자인 토큰과 컴포넌트 manifest — 디자인 교체 가능성

### 5.1 디자인 토큰 (`front/src/styles/tokens.json`)
색상(브랜드 4색·텍스트·배경·보더), 타이포(폰트·크기·행간), 간격, 라운드, 그림자, 모션(duration/easing)을 JSON으로 정의하고 CSS 커스텀 프로퍼티로 변환한다.

- **AC-DT1**: 모든 컴포넌트 SCSS는 색·간격·라운드·그림자를 CSS 변수(`var(--color-*)` 등)로만 참조한다 (하드코딩 금지).
- **AC-DT2**: tokens.json 값만 변경해도 빌드가 깨지지 않고 전체 룩이 바뀐다 (= 테마 교체).

### 5.2 컴포넌트 manifest (`front/src/styles/manifest.json`)
컴포넌트별 `{ name, role, path, variants, tokens(사용 토큰 목록), states }` 를 기계가 읽을 수 있게 기술한다.

- **AC-DM1**: manifest는 실제 존재하는 컴포넌트 경로만 참조한다 (검증 테스트 존재).
- **AC-DM2**: 새 공용 컴포넌트 추가 시 manifest 등록이 컨벤션이다 (front/AGENTS.md에 명시).

## 6. 디자인 개선 맥락 (AI 워크플로)

이 프로젝트는 AI(Claude 등)가 디자인을 반복 개선하는 워크플로를 전제로 설계된다:

1. **입력**: `tokens.json` + `manifest.json` + 실행 화면 스크린샷
2. **제안**: AI가 토큰 변경안(팔레트·타이포·간격) 또는 컴포넌트 개선안을 생성
3. **적용**: 토큰 단위 변경(안전) 또는 manifest에 기술된 컴포넌트 단위 수정
4. **검증**: 기존 테스트 통과 + 스크린샷 비교로 시각 회귀 확인

이를 위해 토큰/manifest는 사람이 아닌 **기계가 읽고 수정하기 좋은 형태**를 유지한다 (주석 대신 `description` 필드, 일관된 네이밍 `color.brand.blue` 등).

---

## 7. 단계별 구현 계획

| 단계 | 내용 | 산출물 | 상태 |
|---|---|---|---|
| **1** | 스캐폴딩: Vite+React+TS, Vitest/RTL, 라우트 뼈대, 콘텐츠 소스 추상화, tokens/manifest 초안, 샘플 콘텐츠 | `npm test` 통과하는 골격 | ✅ 완료 (portfolio_2026) |
| **1.5** | 모노레포 이전: feature 구조, mockup 컬렉션 JSON, axios+React Query+MSW, Go/Gin 골격(조회 API·seed), MongoDB(docker compose) | 계약 테스트 MSW·Go 모두 통과 | ✅ 완료 (2026-10-22) |
| **2** | 인트로 페이지: 구글 2026 첫화면 패러디(헤더·숏컷·AI 모드), 타이핑→일체형 자동완성→키보드 선택 하이라이트, 스킵, reduced-motion, 나비 곡선 비행 | AC-U1, AC-U3 | ✅ 완료 |
| **3** | 검색결과 페이지: 구글 검색결과 헤더(공유·HeaderActions·탭 slot), Swiper 탭+태그 필터, 인물카드(이메일 복사), 프로젝트 그리드, draft placeholder | AC-U2, AC-L1~L4, AC-T1~T2 | ✅ 완료 |
| **4** | 프로젝트 상세 + 시리즈 내비 + RSS/sitemap 빌드 스크립트 | AC-D1~D3, AC-S1~S2, AC-R1~R2, AC-M1~M2 | ✅ 완료 |
| **4.5** | 로그인 UX: mock 소셜 로그인(AuthService 추상화), /login 미니멀 카드+태그라인+혜택 안내, 첫 로그인 방문 목적 설문, StatsService(방문·목적·제공자 수집), /admin 통계 대시보드 | AC-U4, AC-U5 | 진행 |
| **4.6** | 통합검색형 리디자인: 탭 6개, 이력 컬렉션 4개와 목록 API, 인물정보·사이드 카드, 프로젝트 레일·더보기, 상세 md 본문(remark-gfm), 인트로 키보드 수정 (Issue #10) | AC-IA1~IA8 | 진행 |
| **5** | 배포: front Vercel(SPA rewrite, 피드 포함 빌드), back 컨테이너 호스팅, MongoDB Atlas | 프로덕션 URL | 예정 |
| **6** | 확장: Go API 실연동(인증·방문 통계 API, users.role 기반 admin), admin 인라인 편집, **프로젝트 즐겨찾기·방명록**, 검색, AI 디자인 개선 사이클 | 계약 테스트 재사용 | 향후 |

### 개발 프로세스 (전 단계 공통)
- **TDD**: AC → 실패 테스트 → 구현 → 통과 → 리팩터. 테스트 없는 기능 코드 커밋 금지.
- **AI 협업**: Claude Code와 Codex가 같은 지침(AGENTS.md)과 진행 문서(docs/PROGRESS.md)를 공유한다. 커밋은 사용자 요청 시에만.
