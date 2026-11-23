# 경력 화면 개편: 경력기술서형 경력 탭 + 브레이스 상세 화면

## Context
- 전체 탭 "주요 타임라인"에서 브레이스만 제목이 한 줄이라 줄이 안 맞는다.
- 경력 탭을 경력기술서(v35)처럼 바꾸고, 브레이스는 `브레이스_프로젝트.md` 전체 내용을 보는 상세 화면을 둔다.
- 전체 탭 경력 카드의 출처·제목·링크를 정리한다.

## 현재 구조
- 전체 탭: `front/src/features/resume/components/ResumeSections.tsx`의 `ResumeTimeline`(883~), `ResumeResultCards`(778~)
- 경력 탭: 같은 파일 `CareerSection`(68~). mockup `careers.json`에 경력기술서 내용(서비스·역할·지표·주요 프로젝트)이 이미 있다.
- 경력 요약 3줄 = `profiles.json`의 `summary` (전체 탭 카드가 이미 사용)
- 마크다운 렌더링: `ProjectDetailPage.tsx`의 `ReactMarkdown + remarkGfm + markdownComponents`, 스타일 `styles.markdown`
- 라우터: `front/src/app/router.tsx`

## 범위
1. **타임라인 제목**: 경력 항목 제목을 `회사명 (companyNote)`로 → "주식회사 브레이스 (구 아유레디)" 두 줄. (레사모는 서비스 이름이라 넣지 않는다)
2. **전체 탭 경력 카드**
   - 출처 줄: `경력 · 주식회사 브레이스` → `경력`
   - 파란 제목: `주식회사 브레이스` → `/career/brace`(상세 화면). 그 아래 회색 한 줄로 `웹 풀스택 개발 · 5년 8개월`
   - 다른 경력: 파란 링크 `성진에이치디에스`, `필리핀 한인 종합 매거진 뉴스게이트`(회사명만) → 경력 탭의 해당 회사 위치(`/search?tab=career#career-<id>`)
   - 하단 `경력 더보기 >` → 경력 탭 (그대로)
   - "경력 옆 자세히 보기"는 넣지 않는다: 파란 제목이 곧 자세히 보기 링크라 중복. 대신 경력 탭 브레이스 카드 머리에 `자세히 보기 >`를 둔다.
3. **경력 탭 (경력기술서 순서)**
   - 맨 위 경력 타임라인(목차): 브레이스·성진·뉴스게이트, 누르면 해당 카드로 스크롤. `ResumeTimeline`을 항목 배열을 받게 고쳐 재사용
   - 경력 요약 카드: `profile.summary` 3줄 (SearchPage에서 넘김)
   - 회사 카드들: 기존 `CareerSection` 내용 유지, 카드에 `id="career-<id>"`. 브레이스 카드 머리에 `자세히 보기 >` → `/career/brace`
4. **브레이스 상세 화면** `/career/:id`
   - `careers.json` 브레이스 문서에 `body`(마크다운) 추가. 원본 md에서 `# 제목` 줄, `## 4줄 요약`, `## 면접 예상 질문`은 빼고 넣는다(공개 화면에 맞지 않는 준비 자료).
   - `features/resume/pages/CareerDetailPage.tsx`: SearchHeader + 회사명·기간·역할 머리 + 본문 마크다운 + "경력 탭으로" 링크. body 없는 경력·없는 id는 "찾을 수 없음".
   - 마크다운 렌더링은 `ProjectDetailPage`의 것을 `components/ui/Markdown.tsx`(+ scss)로 옮겨 두 화면이 함께 쓴다.
   - 필드 추가: `mockup/careers.json`, `back/internal/model/resume.go` `Career.Body`(`omitempty`), `front/.../resume.types.ts` `body?: string`

## 제외 범위
- 성진·뉴스게이트 상세 화면 (body 없음)
- 경력 상세 전용 API(`/careers/:id`). shortcut: 목록 응답에 body(약 35KB)를 같이 보낸다, 커지면 상세 API로 분리

## 영향 파일
- `front/src/features/resume/components/ResumeSections.tsx`, `.module.scss`, `ResumeSections.test.tsx`
- `front/src/features/resume/pages/CareerDetailPage.tsx`(+scss, test), `features/resume/index.ts`
- `front/src/features/projects/pages/SearchPage.tsx`(요약 전달), `ProjectDetailPage.tsx`(Markdown 사용)
- `front/src/components/ui/Markdown.tsx`(+scss), `front/src/styles/manifest.json`
- `front/src/app/router.tsx`, `router.test.tsx`
- `mockup/careers.json`, `back/internal/model/resume.go`, `front/src/features/resume/types/resume.types.ts`

## 위험
- careers 목록 응답이 커진다(위 shortcut).
- 해시 스크롤은 고정 헤더에 가리지 않게 기존 `scrollToSection` 방식(오프셋)을 쓴다.

## 테스트 (먼저 실패하는 테스트)
- 타임라인: 브레이스 제목에 "(구 아유레디)"
- 전체 탭 카드: 출처 "경력", 제목 링크 "주식회사 브레이스" → `/career/brace`, 다른 경력 링크는 회사명
- 경력 탭: 타임라인·경력 요약·`자세히 보기` 링크 존재
- 상세 화면: `/career/brace`에 본문 제목("서비스 개요") 표시, 없는 id는 찾을 수 없음, "면접 예상 질문" 미표시
- 계약 테스트(MSW·Go) 통과, `make test`, `npm test`/`lint`/`build`
- 브라우저 패널에서 전체 탭·경력 탭·상세 화면 확인

## Acceptance Criteria
- 타임라인 경력 제목이 모두 두 줄 형태로 맞는다
- 전체 탭 경력 카드: 출처 "경력", 파란 제목 "주식회사 브레이스", 다른 경력은 회사명 파란 링크
- 경력 탭: 타임라인 → 경력 요약 → 회사별 카드, 브레이스에 자세히 보기
- `/career/brace`에서 브레이스 프로젝트 문서 내용(면접 질문·4줄 요약 제외)을 볼 수 있다

## Workflow
- type: feat
- issue: new
- title: feat: 경력 탭 경력기술서형 개편과 브레이스 상세 화면
- slug: career-detail
