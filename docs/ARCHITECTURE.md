# ARCHITECTURE

> 구조가 바뀌면 이 문서를 같이 고친다 (session-wrapup).

## 1. 전체 구조
```
portfolio/
├── AGENTS.md / CLAUDE.md      # AI 공통 지침(원본) / Claude 진입점(@AGENTS.md)
├── .agents/skills/            # 공용 스킬 원본 (Codex가 읽음)
├── .claude/                   # settings.json(권한·hook), skills/(→ .agents/skills 심볼릭 링크), hooks/
├── .github/                   # Issue Forms(feature, bug), PR 템플릿, workflows/ci.yml(front·back)
├── scripts/devflow.py         # GitHub 워크플로 도우미 (docs/WORKFLOW.md)
├── docs/                      # PRD, ARCHITECTURE, DECISIONS, PROGRESS, WORKFLOW, plans/(승인된 계획 기록)
├── mockup/                    # 컬렉션별 JSON = Mongo 시드 = API 계약
├── front/                     # React SPA
├── back/                      # Go API
├── design/  reference/        # 시안·참고 자료 (코드가 읽지 않음)
└── docker-compose.yml         # 로컬 MongoDB 7
```

## 2. 데이터 흐름
```
mockup/*.json ──(back: make seed)──▶ MongoDB ──▶ repo ─▶ service ─▶ handler ─▶ /api/v1 ─┐
      │                                                                                   ├─▶ axios(lib/axios) ─▶ features/*/api ─▶ hooks(React Query) ─▶ pages
      └──(front: @mockup alias)──▶ MSW handlers(src/mocks) ─────────────────▶ /api/v1 ─┘
```
- 개발 초기에는 MSW가 응답하고(`VITE_USE_MOCK` 미설정 또는 `true`), 백엔드가 준비되면 `VITE_USE_MOCK=false`와 `VITE_API_BASE_URL`로 바꾼다.
- 같은 계약 테스트(`front/src/mocks/apiContract.ts`)를 MSW와 Go API 둘 다에 돌려 동작이 같은지 확인한다.

## 3. API (v1)
| 메서드 | 경로 | 응답 | 비고 |
|---|---|---|---|
| GET | `/health` | `{status, db}` | DB ping 실패 시 503 |
| GET | `/profile` | Profile | 문서 1개 |
| GET | `/categories` | Category[] | order 오름차순 |
| GET | `/projects` | Project[] (body 제외) | `category`, `tag`, `includeDrafts=true`. 기본은 draft 제외. featured 우선 → publishedAt 내림차순 |
| GET | `/projects/:slug` | Project (body 포함) | 없으면 404. draft도 반환하고, 프론트가 숨긴다 |
| GET | `/tags` | string[] | 공개 프로젝트 기준, 중복 없음, 한글 → 영문 순 |
| GET | `/series` | `{name, order, projects[]}`[] | 공개 프로젝트 기준, order 순 |

에러 형식: `{"error": {"code": "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL", "message": "..."}}`

## 4. 컬렉션 (mockup 파일 = 컬렉션)
| 컬렉션 | 주요 필드 | 인덱스 |
|---|---|---|
| `profiles` | `_id`, name, nameEn, role, birth, location, kakaoId, email, website, github, avatar?, keywords[], body(md) | — |
| `projects` | `_id`(slug), title, categoryId, kind?, summary, tags[], series?{name, order}, publishedAt(YYYY-MM-DD), thumbnail?, link?, github?, featured, draft, body(md) | categoryId, tags, (featured, publishedAt) |
| `categories` | `_id`(resume·publishing·design·study·etc), label, order | — |
| `users` | `_id`, name, provider(kakao·github), providerId, role(admin·user), purpose?, createdAt | (provider, providerId) unique |
| `visits` | `_id`, userId?, path, visitedAt | visitedAt |

- 태그와 시리즈는 projects 안에 넣어 두고(embed) 집계해서 응답한다. 별도 컬렉션을 만들지 않는다.
- 날짜는 현재 문자열(ISO)로 저장한다. 정렬과 범위 조회가 필요해지면 BSON Date로 바꾸는 방안을 DECISIONS에 남긴다.

## 5. front (`front/src`)
```
app/          App.tsx, main.tsx(MSW 시작), router.tsx, providers.tsx(QueryClient + Auth)
components/   ui/(Chip), layout/(SearchHeader, HeaderActions, Logo)
features/
  intro/      components/(IntroHeader, IntroShortcuts), hooks/useIntroSequence, pages/IntroPage
  projects/   api/(projects.api, projectMapper), components/(ProjectCard, CategoryTabs, SeriesNav),
              hooks/useProjects, pages/(SearchPage, ProjectDetailPage), types/
  profile/    api/profile.api, components/ProfileCard, hooks/useProfile, types/
  auth/       api/(AuthService, MockAuthService, auth.api), hooks/AuthContext, pages/LoginPage
  admin/      api/(StatsService, MockStatsService, stats.api, labels), pages/AdminPage
lib/          axios.ts, queryClient.ts
mocks/        handlers.ts, queries.ts(백엔드 규칙 흉내), browser.ts, server.ts, apiContract(.test).ts
styles/       global.scss, tokens.json, applyTokens.ts, manifest.json
types/        api.types.ts (공통 에러 형식)
test/         setup.ts, queryClient.ts
```
- 라우트: `/` Intro, `/search` 검색결과, `/project/:slug` 상세, `/login`, `/admin`
- 인증(auth)과 방문 통계(admin)는 아직 localStorage mock이다. 백엔드 API가 생기면 `auth.api.ts`, `stats.api.ts`의 구현체만 바꾼다.
- 빌드 후 `scripts/generate-feeds.ts`가 `../mockup/projects.json`으로 `dist/feed.xml`과 `sitemap.xml`을 만든다.

## 6. back (`back/`)
```
cmd/server    조립: config → db.Connect → EnsureIndexes → repo → service → handler → router
cmd/seed      mockup/*.json → 컬렉션 upsert (-drop, -dir)
internal/
  config      env: PORT, MONGO_URI, MONGO_DB, CORS_ORIGINS
  db          연결·종료, 컬렉션 이름 상수, 인덱스
  model       컬렉션 문서 struct, 공통 오류(ErrNotFound, ErrInvalid), ProjectQuery
  repo        컬렉션별 Mongo 쿼리 (project, profile, category, user, visit)
  service     규칙(태그·시리즈 집계, 한국어 정렬). Store interface 정의
  handler     Gin 핸들러, 에러 → HTTP 매핑. Service interface 정의
  middleware  CORS, Timeout, (auth 자리)
  router      /api/v1 라우트 등록
```

## 7. 배포
- 현재: GitHub Pages `https://jexists.github.io/portfolio/` — `.github/workflows/deploy-pages.yml`이 main push(또는 수동 실행) 때 front를 MSW 목업 모드로 빌드해 올린다.
  - `VITE_BASE_PATH=/portfolio/` → vite `base`, 라우터 `basename`, MSW worker URL이 모두 `import.meta.env.BASE_URL`을 따른다(기본값 `/`라 로컬·Vercel은 그대로).
  - SPA 딥링크는 `dist/404.html`(index.html 복사본)으로 처리한다. RSS·sitemap은 `SITE_URL`로 생성한다.
- 이후 계획 (PRD §7 단계 5)
- front: Vercel (`front/vercel.json` SPA rewrite). 백엔드 전환 전까지는 MSW 목업으로도 동작한다.
- back: 컨테이너 호스팅 (Fly.io / Render / Cloud Run 중 선택, `back/Dockerfile`)
- DB: MongoDB Atlas (접속 문자열은 호스팅 환경변수에만 둔다)
