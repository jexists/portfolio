# 웹사이트 디자인 기준

포트폴리오 웹(`front/`)의 현재 디자인 기준. 값의 원본은 [`front/src/styles/tokens.json`](front/src/styles/tokens.json)이고, 이 문서는 값을 **어디에 어떻게 쓰는지**를 정한다. 둘이 다르면 `tokens.json`이 맞고 이 문서를 고친다.
A4 이력서·경력기술서 PDF의 기준은 이 문서의 대상이 아니다.

## 원칙

- 컨셉: 검색엔진에서 "정주애"를 검색한 결과 화면.
- 색·간격·라운드·그림자·모션은 토큰(CSS 변수)으로만 쓴다. 변수 이름은 경로를 `-`로 이은 것이다 (`color.text.muted` → `--color-text-muted`).
- 컴포넌트·페이지 목록은 [`front/src/styles/manifest.json`](front/src/styles/manifest.json)에 둔다. 추가·이동하면 함께 고친다.
- UI 텍스트는 한국어. 애니메이션은 `prefers-reduced-motion`을 존중한다.

## 색

| 역할 | 토큰 | 값 |
|---|---|---|
| 브랜드 (로고·강조) | `color.brand.blue / red / yellow / green` | `#4285F4` `#EA4335` `#FBBC05` `#34A853` |
| 본문 | `color.text.primary` | `#1F2937` |
| 설명 | `color.text.secondary` | `#4B5563` |
| 보조·캡션 | `color.text.muted` | `#6B7280` |
| 링크 / 방문한 링크 | `color.text.link / visited` | `#1A56D6` / `#681DA8` |
| 배경: 페이지 / 카드 / 옅은 면 | `color.bg.page / surface / subtle` | `#F8FAFC` `#FFFFFF` `#EEF2F7` |
| 테두리: 기본 / 강조 / 옅음 | `color.border.default / strong / subtle` | `#D7DEE8` `#AAB5C4` `#EDF0F4` |
| 이력서 문서: 본문 / 제목 / 포인트 | `color.resume.text / heading / accent` | `#2B2F36` `#1F232A` `#24456B` |

검색결과·인트로·로그인 전용 색은 `tokens.json`의 `color.search`, `color.intro`, `color.auth`, `color.login`을 쓴다.

## 타이포그래피

글꼴: `Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

### 크기와 굵기

| 토큰 `font.size` | 값 | 주 용도 |
|---|---|---|
| `xs` | 0.75rem | 캡션, 배지 |
| `sm` | 0.875rem | 설명, 메타, 목록 |
| `base` | 1rem | 본문, 항목 제목 |
| `lg` | 1.125rem | 섹션·카드 제목 |
| `xl` | 1.5rem | 페이지 제목 |
| `2xl` | 2rem | 관리자 통계 숫자 |
| `logo` | 4.5rem | 로고 |

굵기는 `regular` 400, `medium` 500, `bold` 700. 자간은 `normal`(0)만 쓴다.

이력서·경력기술서 탭은 `resume` 그룹을 따로 쓴다: 이름 2.25rem, 섹션 제목 1.25rem, 항목 제목 1rem, 본문 0.875rem, 작은 글씨 0.8125rem.

### 줄간격

| 토큰 `font.line-height` | 값 | 대상 |
|---|---|---|
| `tight` | 1 | 한 줄로 고정된 요소만: 칩, 배지, 로고, 큰 숫자 |
| `heading` | 1.3 | 제목 `h1`~`h4` (`global.scss`에서 공통 적용) |
| `compact` | 1.3 | 제목 아래 카드·목록 설명, 불릿 |
| `body` | 1.5 | `body` 기본값, Markdown 본문 |

| 이력서 문서 토큰 `resume.*` | 값 |
|---|---|
| `heading-line-height` | 1.3 |
| `body-line-height` | 1.55 |
| `item-line-height` (점 목록·기술 상세) | 1.4 |
| `contact-line-height` | 1.7 |

- 제목 줄간격은 `compact`·`body`를 줄이더라도 1.3을 유지한다.
- 이력서 이름(`h1`)은 한 줄이라 `tight`를 쓴다.

### 줄바꿈

- `body`: `word-break: keep-all` + `overflow-wrap: anywhere`. 한글은 어절 단위로 끊고, 한 어절이 줄보다 길 때만 중간에서 끊는다.
- 제목: `text-wrap: balance`.

## 간격

### 간격 토큰

`space`: `0`, `1` 4px, `2` 8px, `2-5` 10px, `3` 12px, `4` 16px, `6` 24px, `8` 32px, `12` 48px

### 텍스트 간격 위계

간격이 모두 같으면 어디까지가 한 항목인지 보이지 않는다. 아래 순서로 넓어지게 한다.

**이어지는 줄 ≤ 같은 항목 안의 줄 나눔 < 항목 사이 < 제목 → 본문 < 블록 사이**

| 단계 | 만드는 방법 |
|---|---|
| 자동 줄바꿈으로 내려간 줄 | `line-height` |
| 같은 항목 안에서 Enter로 나눈 줄 (`\n`, `<br>`) | `line-height`만. 여백을 더하지 않는다 |
| 항목 사이 (불릿, 점 목록) | `gap` 또는 `margin-top: space-1`. 한 목록 안에서는 모두 같은 값 |
| 제목 → 본문 | 본문 안의 줄 사이보다 넓게 보이도록 본문 `line-height`를 좁힌다 |
| 블록·섹션 사이 | `space-3` 이상 |

"제목 → 본문"은 CSS 여백 값 하나가 아니라 화면에 보이는 간격으로 비교한다. 여백이 4px이어도 본문 줄간격이 좁으면 구분된다.

### 컴포넌트별 적용값

| 위치 | 줄간격 | 항목·제목 간격 |
|---|---|---|
| 프로젝트 검색 결과 설명·메타 (`ProjectCollections`) | `compact` | 제목 → 설명 `space-1` |
| 프로젝트 카드 설명·메타 (`ProjectCard`) | `compact` | `space-1` |
| 경력 카드 불릿 (`ResumeSections`) | `compact` | 불릿 사이 `space-1` |
| 결과 카드·학교 카드 설명, 프로젝트 박스 설명 | `compact` | — |
| 기술 상세·교육 과정 목록 | `resume.item` | 항목 사이 `space-1`, 소제목 → 목록 8px |
| 이력서 점 목록·보유기술 (`ResumeDocument`) | `resume.item` | 항목 사이 `space-1` |
| Markdown 본문 (`Markdown`) | `body` | `li` 사이 `space-1`, 제목 위 `space-6`·아래 `space-2` |

## 모서리·테두리·그림자

- `radius`: `badge` 2px(배지), `sm` 4px, `md` 8px, `lg` 12px(카드), `pill` 999px
- 테두리: `default` 1px, `strong` 2px
- `shadow`: `sm`, `md`, `intro-search`(인트로 검색창)

## 레이아웃과 반응형

- 검색 결과 본문 최대 폭 43rem, 헤더 최대 폭 90rem, 사이드 22rem, 카드 안쪽 여백 `space-6`.
- 주 분기점은 `max-width: 48rem`. 일부 화면만 `42rem`, `80rem`을 함께 쓴다.
- 새 화면은 PC 1280px와 모바일 375px에서 확인하고, 모바일에 가로 스크롤이 없어야 한다.

## 모션

시간과 easing은 `motion` 토큰을 쓴다. 일반 전환은 `fast` 120ms, `normal` 200ms, `slow` 320ms. 로고·나비·인트로 전용 값도 같은 그룹에 있다.
