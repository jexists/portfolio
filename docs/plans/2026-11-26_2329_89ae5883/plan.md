# 타이포그래피 일관성 검수·개선 계획

## Context
포트폴리오 front 전체에서 같은 역할의 제목·본문이 페이지마다 다른 line-height로 렌더링된다. 구조 변경 없이 **타이포 토큰 몇 개와 해당 SCSS 선언만** 손봐 일관성을 맞춘다. 범위는 타이포(font-size / line-height / weight / letter-spacing)뿐이다. 모바일 반응형, 레이아웃, 기능, 신규 라이브러리는 건드리지 않는다.

## 1차 진단 (코드 기준 — 브라우저 렌더 확인은 구현 단계에서 수행)
스캔 결과(`src/**/*.scss`, 약 5,900줄):
- **line-height 체계가 3갈래로 갈라져 있다**
  - 토큰 `--font-line-height-tight: 1`(13곳)과 `--font-line-height-body: 1.75`(2곳, Markdown·Login)
  - `global.scss` body의 하드코딩 `1.6`
  - resume 전용 토큰(`heading 1.3`, `body 1.65`, `item 1.45`, `contact 1.9`)
  - 하드코딩 1.4 / 1.45 / 1.5 / 1.6이 6곳 (ProjectDetail, ProfileCard, CareerDetail, ResumeSections 등)
- **제목 줄간격이 역할은 같은데 값이 제각각이다**
  - `line-height: 1`(tight): ProjectDetail h1, CareerDetail h1, ProfileCard h1·h2, Admin 제목, Markdown h2~h4. 2줄로 꺾이면 줄이 붙어 답답하다.
  - line-height 미지정(body 1.6 상속): ProjectCard 제목(h3), Card h2, ProjectCollections h3, ResumeSections의 careerHead·resultCard·sectionHead·schoolCard h3. 2줄이면 줄 사이가 지나치게 넓다.
  - resume 문서(ResumeDocument·CareerDocument)는 1.3.
  - 한 줄 제목에만 맞춘 값이 그대로 여러 줄에 적용되고 있다.
- **font-size 스케일**: xs / sm / base / lg / xl / 2xl 토큰은 잘 쓰인다(sm 65곳). `14px` 하드코딩 1곳과 resume 전용 크기(0.8125rem, 1.25rem, 2.25rem)는 의도된 문서 스타일로 보고 유지한다.
- **같은 역할의 제목 크기 불일치**: 페이지 제목(h1)이 모두 xl이라 크기는 일관적이다. 섹션 카드 제목은 lg, 목록 항목 제목은 base/lg로 갈린다. 크기 위계는 대체로 정상이라 **크기 대신 line-height 정리가 핵심**이다.
- **weight**: 제목 중 일부는 `bold`를 명시하고 일부는 UA 기본 bold에 의존한다(h1·h2·h3). 값은 같지만 명시 여부가 다르다. `font-weight: normal` 3곳은 `--font-weight-regular`와 같은 값이다.
- **letter-spacing**: 토큰은 `normal` 하나뿐이고 사용처도 3곳이라 불일치가 없다. 손대지 않는다.

## 2차 기준 (토큰으로 추가 — `styles/tokens.json`의 `font.line-height`만 확장)
| 역할 | 크기 | line-height | weight | 적용 대상 |
|---|---|---|---|---|
| 페이지 제목(h1, 여러 줄 가능) | xl | **heading 1.3** | bold | ProjectDetail·CareerDetail·ProfileCard h1, Admin 제목 |
| 섹션·카드 제목(h2) | lg | **heading 1.3** | bold | Card h2, ProfileCard sideHead h2, ResumeSections sectionHead h2, Markdown h2 |
| 항목 제목(h3, 여러 줄 가능) | base~lg | **heading 1.3** | 기존 유지 | ProjectCard, ProjectCollections, ResumeSections의 career·result·school h3, Markdown h3·h4 |
| 본문 | sm~base | **body 1.65** | regular | body 기본(현 1.6 하드코딩 → 토큰), Markdown(1.75→유지 여부는 렌더 확인 후 결정) |
| 보조 설명·캡션 | xs~sm | body 상속 | regular | 변경 없음 |
| 한 줄 요소(칩·배지·로고) | — | tight 1 유지 | — | Chip, TechBadge, Logo, 한 줄 버튼 |

핵심 원칙: `tight(1)`은 칩·배지·로고처럼 **한 줄로 고정된 요소**에만 쓴다. 제목은 resume 문서가 이미 쓰는 `1.3`을 공용 `--font-line-height-heading`으로 올려 쓰되, 값은 렌더 확인 후 조정한다. 별도 크기 토큰은 만들지 않는다.

## 3차 수정 범위 (필요한 선언만, 파일 재구성 없음)
1. `styles/tokens.json`: `font.line-height.heading`(1.3 시작값) 추가. `body`는 렌더 확인 후 1.6~1.7로 정한다. `tokens.json` → CSS 변수 변환은 `applyTokens.ts`가 처리하므로 코드 변경이 없다.
2. `styles/global.scss`: body `line-height: 1.6` → `var(--font-line-height-body)`.
3. 제목 규칙에 `line-height: var(--font-line-height-heading)` 적용 또는 교체(기존 tight 제거).
   - `ProjectDetailPage`, `CareerDetailPage`, `ProfileCard`, `AdminPage`, `Markdown`
   - `Card`, `ProjectCard`, `ProjectCollections`, `ResumeSections`
4. 하드코딩 1.4 / 1.45 / 1.5 / 1.6 중 **제목·본문 역할**인 것만 토큰으로 바꾼다. 실제 용도가 다른 값(텍스트 패널 `.otherPanel` 등)은 렌더에서 문제가 없으면 그대로 둔다.
5. resume 전용 토큰은 `heading-line-height`를 공용 heading 토큰 값과 맞추는 정도만 한다. 구조는 합치지 않는다. 이 화면은 A4 문서형이라 독립 토큰으로 유지한다.

제외: 크기·색·간격·레이아웃 변경, 컴포넌트 구조 변경, 모바일 전용 미디어쿼리 수정, 로고·인트로(애니메이션 수치 영향).

## 판단 원칙 (사용자 추가 지침 반영)
- 위 수치(heading 1.3 등)는 **시작값일 뿐**이다. 수치가 다르다는 이유만으로는 수정하지 않고, 렌더링된 화면에서 디자인 품질을 떨어뜨리는 경우에만 고친다.
- 구현 첫 단계에서 코드 수정 전에 **현재 화면을 먼저 렌더링해 스크린샷으로 진단**한다(데스크톱 + 모바일 375px). 이 진단으로 위 코드 기반 가설을 검증하고 계획을 보정한다.
- 화면에서 보는 항목: 줄간격의 자연스러움, 2줄 이상 제목의 균형(필요하면 `text-wrap: balance`를 제목에 한정해 검토), 크기·줄간격·여백의 조화, 이미지·카드·버튼과의 어울림, 페이지 전체 밀도, 같은 역할 요소의 페이지 간 인상.
- 모바일: 레이아웃 개편은 하지 않는다. 타이포 때문에 줄바꿈이 어색하거나 텍스트 블록이 화면에 안 맞는 곳만 타이포 선언(크기·줄간격·줄바꿈)으로 보정하고 확인한다.
- 매 회차 수정 후 같은 화면을 다시 렌더링해 **이전보다 실제로 나아졌는지** 비교하고, 나아지지 않았으면 되돌린다.

## 검수 대상 (실제 확인 여부를 페이지별로 기록)
라우트: `/`(인트로), `/search`(탭: 프로젝트·프로필·경력·학력·스킬·이력서 등 SearchPage 내부), `/project/:slug`, `/career/:id`, `/login`, `/admin`.
공통 컴포넌트: Card, Chip, TechBadge, Markdown, PageState, Header·Footer, ProjectCard·Gallery·Collections, ProfileCard.
각 화면을 데스크톱(약 1280px)과 모바일(375px)에서 렌더링한다. 모바일은 레이아웃 개편 없이 타이포(줄바꿈·크기·줄간격) 확인과 보정만 한다. 인증이 필요한 `/admin`은 로컬 빠른 로그인으로 접근하고, 접근하지 못하면 미검수로 기록한다. 확인하지 못한 화면은 검수 완료로 보고하지 않는다.

## 반복 QA 루프 (최대 8회)
0. 수정 전 기준 렌더링으로 전 화면 baseline 스크린샷을 찍고 문제 목록을 만든다.
1. 렌더링 화면을 검수하고 문제를 **Critical / Major / Minor**로 분류한다.
   - Critical: 잘림·겹침, 읽기 어려운 줄간격
   - Major: 같은 역할의 명백한 불일치, 여러 줄 제목의 어색한 간격, 페이지 간 일관성 훼손
   - Minor: 미세한 차이·취향 문제. 개선 효과와 부작용 위험을 비교해 판단하고, 무조건 고치지 않는다.
2. Critical·Major를 우선 수정한다(공통 토큰·공통 스타일 우선, 예외는 이유가 있을 때만).
3. 다시 렌더링해 수정한 화면과 영향받을 다른 화면을 함께 확인한다. 이전에 해결한 문제가 재발하지 않았는지 본다.
4. 이전보다 나아지지 않았거나 부작용이 생기면 그 수정을 되돌린다. 같은 문제를 CSS 값만 바꾸며 반복하지 않는다.
5. 새 문제는 기록하고 다음 루프로 넘어간다.

**종료 조건**: 지정한 모든 화면의 검수 완료, Critical 0, Major 0, 수정한 타이포가 브라우저에서 검증됨, 기능·레이아웃 부작용 없음, 남은 항목은 Minor이거나 수정 위험이 더 큰 것. 8회에 도달해도 조건 미충족이면 완료 처리하지 않고 미해결 문제·원인·필요한 작업을 보고한다.
도구는 `preview_start`(front dev 서버, MSW 목업), `computer` 스크린샷, `resize_window`, `read_console_messages`, `javascript_tool`의 computed style을 쓴다. 긴 제목 확인은 데이터를 저장하지 않고 DOM에서 일시 조작한다. 브라우저를 쓸 수 없으면 그 사실을 보고하고 검증했다고 주장하지 않는다.
최종 빌드·테스트: `cd front && npm test && npm run lint && npm run build`.

## 캡처 기반 검수 (필수)
- 코드만 읽고 품질을 판단하지 않는다. 모든 검수 대상 화면을 `preview_start`로 띄운 front 앱에서 **PC 1280px와 모바일 375px**로 렌더링해 스크린샷을 직접 확인한다. 뷰포트는 `resize_window`로 지정한다.
- PC: 제목·본문·카드·Hero·공통 컴포넌트 비교, 같은 역할 요소의 페이지 간 인상, 여러 줄 제목의 줄간격·줄바꿈, 텍스트와 주변 콘텐츠의 간격·균형.
- 모바일: 여러 줄로 꺾인 제목의 줄간격·줄바꿈, 폰트 크기·텍스트 밀도, 잘림·겹침, 제목·본문·버튼·카드 간 간격, PC와 같은 역할의 타이포 일관성. 레이아웃 개편은 하지 않고 타이포 선언으로만 보정한다.
- 매 QA 루프마다 수정한 화면을 다시 캡처해 **수정 전후를 비교**한다. 캡처를 실제로 보지 않은 화면은 검증 완료로 보고하지 않는다.
- 캡처한 화면 목록(라우트 × PC/모바일)을 체크리스트로 관리해 최종 보고에 붙인다. 브라우저 실행이나 캡처가 불가능하면 코드 기반 검수만 했고 시각 검증은 미완료라고 명시한다.

## 줄간격 위계 원칙 (사용자 지침)
텍스트 블록 안의 간격을 세 단계로 구분해 맞춘다.
1. **자동 줄바꿈으로 내려간 줄**(같은 문장의 이어지는 줄): 가장 촘촘하다. 제목 약 1.25~1.3, 본문 약 1.55~1.65를 시작값으로 한다.
2. **Enter로 나눈 줄·문단·목록 항목**(`<br>`, `white-space: pre-line`, `p`/`li` 사이): 1번보다 눈에 띄게 넓지만 과하지 않다. line-height가 아니라 margin/gap으로 준다. 대략 줄높이의 0.3~0.5배(0.25~0.5rem)를 시작값으로 한다.
3. **블록·섹션 사이**: 2번보다 더 넓다(기존 space 토큰 유지).
- 현재 `white-space: pre-line`(ResumeSections 1411, 1428)과 `<br>`(CareerDocument, ResumeSections 975)는 줄바꿈 간격이 line-height에만 의존해 1번과 구분되지 않는다. 렌더 확인 후, 구분이 필요한 곳에서만 간격을 둔다.
- 값은 캡처를 보며 정한다. 2번이 1번보다 달라 보이면서 너무 벌어져 보이지 않는 지점을 찾는다.

## 영향 파일
`front/src/styles/tokens.json`, `front/src/styles/global.scss`, 위 3번의 `*.module.scss` 약 9개. `styles/manifest.json`은 컴포넌트를 추가·이동하지 않으므로 변경하지 않는다.

## 위험·호환성
- heading line-height를 1 → 1.3으로 키우면 한 줄 제목의 높이가 약간 늘어 카드 높이가 변할 수 있다. 렌더에서 확인하고 카드 정렬이 깨지면 해당 지점만 조정한다.
- 1.6 상속 제목을 1.3으로 줄이면 카드 높이가 줄어든다. 의도된 변화이며, 그리드 정렬이 flex/grid인지 렌더에서 확인한다.
- `front/src/styles/applyTokens.test.ts`가 토큰 변환을 검증하므로 토큰 추가 시 함께 확인한다.
- 모바일은 수정 대상이 아니다. 같은 선언이 모바일에도 적용되므로 큰 깨짐이 없는지만 한 번 훑는다.

## 테스트 / Acceptance Criteria
- `cd front && npm test && npm run lint && npm run build` 통과.
- 같은 역할의 제목(h1·h2·h3)이 같은 line-height 토큰을 쓴다. `tight`는 한 줄 고정 요소에만 남는다.
- 2줄 이상 제목에서 줄이 붙지도 지나치게 벌어지지도 않는다(브라우저에서 확인).
- 하드코딩 line-height가 줄어들고 신규 CSS 중복이 늘지 않는다.
- 기능·레이아웃·애니메이션에 변화가 없다.
- 최종 보고에 실제 브라우저로 확인한 항목과 코드로만 판단한 항목을 구분해 적는다.

## Workflow
- type: refactor        # feat|fix|refactor|docs|chore|test
- issue: none           # new | #번호(재사용) | none(사소한 작업)
- title: refactor: 타이포그래피 line-height 기준 통일
- slug: typography-consistency

---

# 추가 라운드: 제목·본문·줄바꿈·항목 간격 위계 정리 (사용자 스크린샷 2장 기반)

## Context
스크린샷 2장에서 간격 위계가 무너져 있다.
1. **프로젝트 검색 결과 항목**(`ProjectCollections` `.list`): 제목 → 설명 첫 줄 → 설명 둘째 줄 → 메타 간격이 전부 비슷하다. 사용자 기준은 "제목과 본문 사이보다 본문 안의 줄 사이가 더 좁아야 한다"이다.
2. **경력 카드 불릿**(`ResumeSections` `.career .bullets`): 불릿 사이와 같은 항목 안에서 `\n`으로 나뉜 둘째 줄("InDesign으로…")의 간격이 같다. 사용자 기준은 "불릿 사이 간격은 서로 같고, 같은 불릿 안의 이어지는 줄은 그보다 가까워야 한다"이다.

원인(코드 확인): `.career .bullets { gap: 0 }`(ResumeSections.module.scss 약 1408행)이라 불릿 간격이 0이고 줄간격만 남는다. `.list p`는 margin-top만 `space-1`이고 본문 line-height는 body 1.5라, 제목-본문 간격과 본문 줄간격이 구분되지 않는다.

## 적용할 간격 위계 (모든 텍스트 스택 공통)
간격 크기는 **A(이어지는 줄) < B(같은 항목 안 줄 나눔) < C(항목 사이) < D(제목 → 본문) < E(블록 사이)** 순서가 되게 한다.
- A. 자동 줄바꿈으로 내려간 줄: line-height가 결정한다. 본문 1.4~1.5.
- B. 같은 항목 안에서 Enter로 나눈 줄(`\n`, `<br>`): A와 같거나 아주 조금 넓은 정도다. 항목 사이보다는 확실히 좁다.
- C. 목록 항목(불릿·카드 행) 사이: margin/gap으로 준다. 같은 목록 안에서는 모두 같은 값이다.
- D. 제목 → 첫 본문 줄: 본문 줄간격보다 넓다.
- E. 블록·섹션 사이: 기존 space 토큰을 유지한다.
기존 설계가 이미 맞는 곳(이력서 문서 `.sec li`: 줄 1.4, 항목 사이 0.25rem)은 건드리지 않는다.

## 수정 방향 (필요한 선언만, 구조 변경 없음)
1. `ResumeSections.module.scss`: `.career .bullets`의 `gap: 0`을 `space-1`(기본 `.bullets`와 같은 값)로 바꾼다. 그러면 항목 사이가 `\n` 줄보다 넓어진다. 필요하면 `.bullets li`의 line-height를 compact로 맞춘다.
2. `ProjectCollections.module.scss`: `.list p`(설명)에 `line-height: var(--font-line-height-compact)`를 주고, 제목-설명 간격(`margin-top`)은 설명 줄간격보다 넓게 유지한다. 메타 줄 위 간격도 같은 위계로 맞춘다. `ProjectCard`(rail 카드)는 이미 compact를 적용했다.
3. **전수 확인**: 같은 패턴(제목+설명+메타, 목록+이어지는 줄)을 쓰는 모든 컴포넌트를 렌더링해 하나씩 확인한다. 대상은 ProfileCard 정보 행, 타임라인 항목, CareerDetailPage 개요·업무 블록, ResumeSections의 careerHead·resultCard·schoolCard·course·skillGroup, ProjectGallery·SeriesNav, ProjectDetail hero, Markdown(제목-본문-목록), 경력기술서·이력서 문서, 푸터·로그인·관리자다. 위 위계에 어긋나는 곳만 해당 스타일에서 고친다. 값이 같다는 이유만으로는 고치지 않는다.
4. 값은 새 토큰 없이 기존 `font.line-height.{heading,compact,body}`와 `space-*`로 표현한다. 새 하드코딩 값은 만들지 않는다.

## 검증
- `preview_start`(front-dev)로 PC 1280px와 모바일 375px에서 위 컴포넌트를 렌더링하고, 수정 전후 캡처를 비교한다. 사용자가 보낸 두 화면(프로젝트 목록의 SalesLuv 항목, 경력 카드의 매거진 불릿)을 같은 위치에서 다시 캡처한다.
- computed style로 A/B/C/D 간격(줄 높이, margin, gap)을 숫자로 확인해 위계(A < C < D)가 성립하는지 본다.
- 제목은 이전 값(1.3)을 유지하고, 본문·카드 텍스트의 앞서 줄인 값도 그대로다.
- `cd front && npm test && npm run lint && npm run build`. 모바일 가로 넘침 여부도 `scrollWidth`로 확인한다.
- 확인하지 못한 화면(관리자 등)은 미검수로 기록한다.

## 영향 파일 (예상)
`front/src/features/resume/components/ResumeSections.module.scss`, `front/src/features/projects/components/ProjectCollections.module.scss`, 전수 확인에서 어긋난 곳의 `*.module.scss` 몇 개. 토큰 파일은 변경하지 않는 것이 목표다.

## 위험
`gap`을 키우면 경력 카드 높이가 조금 늘어난다. 앞서 "전체적으로 간격을 줄여 달라"는 요청이 있었으므로, 항목 사이는 `space-1`(4px) 이내로 하고 줄 사이는 오히려 compact로 줄여 전체 높이가 늘지 않게 맞춘다.

## Workflow
- type: refactor
- issue: none
- title: refactor: 제목·본문·항목 간격 위계 정리
- slug: typography-spacing-hierarchy
