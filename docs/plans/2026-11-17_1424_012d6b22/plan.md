# 구글 검색 컨셉 포트폴리오: 정보 구조 개편과 직무 렌즈

> **이번 승인 범위는 1단계(와이어프레임 HTML)뿐이다.** 사용자가 `docs/wireframe.html`을 브라우저에서 확인하고 승인하면, 아래 "2단계 구현" 내용으로 별도 계획을 다시 세운다.

## 1단계: 와이어프레임 HTML (이번 작업)
- 파일: `docs/wireframe.html` 한 개. 외부 의존성 없이 HTML, CSS, 바닐라 JS만 쓰고, 더블클릭으로 바로 열리게 한다.
- 화면: ① 첫 화면(로고, 검색창, 직무 자동완성) ② 검색결과의 6개 탭(전체 / 경력사항 / 프로젝트 / 기술스택·자격 / 학력·교육 / 기타) ③ 프로젝트 상세 1장
- 전체·경력·프로젝트 탭에 직무 렌즈 칩(전체/개발/FDE/기획·PM·PO/QA)을 둔다. 칩을 누르면 검색어, 헤드라인, 강조 순서가 바뀐다.
- 오른쪽 지식 패널, 관련 질문(펼치기), 경력 성과 숫자를 넣는다.
- 데스크톱/모바일 폭 전환 버튼을 둔다(390px 프레임 미리보기).
- 내용: profile body의 실제 정보(브레이스, 8만 명, 26,000건)를 쓴다. 학력·교육·자격과 FAQ 답변은 노란 "입력 필요" 표시로 비워 둔다.
- 와이어프레임 톤으로 만든다(회색 위주, 구글 파랑 링크색만 사용). 최종 색과 글꼴은 이후 시안 단계에서 정한다.
- 확인: 브라우저 패널에서 열어 탭 6개, 렌즈 5개, 모바일 폭을 직접 눌러 보고 스크린샷으로 확인한다.

---
# 2단계 구현 (참고, 1단계 승인 후 다시 계획)

## Context
지금 `/search`는 인물카드, 태그, 프로젝트 그리드 하나뿐이고, 탭(이력서/퍼블리싱/디자인/스터디/기타)은 "전체" 말고는 비어 있다(PRD AC-L1).
개발, 기획, PM, PO, PL, QA, FDE에 함께 지원하려면 채용담당자가 **30초 안에 그 직무에 맞는 근거**를 봐야 한다.
목표: 구글 검색결과 문법(탭, 결과 목록, 오른쪽 지식 패널, 관련 질문)으로 경력, 학력, 프로젝트를 정리하고, **검색어로 직무 렌즈**를 바꾸게 한다.

## 콘텐츠 원칙 (질문에 대한 답)
- **모든 것 vs 핵심**: 기본 화면은 핵심만 보여 준다. 다만 사이트를 두 개로 만들지 않는다. 오래된 작업, 스터디, 클론 같은 전체 기록은 "더보기" 탭에 아카이브로 둔다.
- **학력은 대학(전공)과 교육과정부터** 적는다. 초·중·고는 적지 않는다(채용에서 보지 않음).
- **직무는 4개 렌즈로 묶는다.** 데이터는 하나이고, 렌즈마다 순서, 강조, 헤드라인만 바뀐다.
  - 개발(FE/BE/풀스택) · FDE · 제품(기획/PM/PO/PL, PL은 리드 경험으로 이 렌즈에 넣음) · QA
- 직무별 이력서 PDF는 링크 필드만 둔다(PDF 제작은 범위 밖).

## 사이트맵
| 경로 | 화면 | 내용 |
|---|---|---|
| `/` | 검색 첫 화면 | 자동완성: 정주애 / 정주애 개발자 / FDE / 기획 PM PO / QA. 가만히 두면 "정주애"를 자동으로 검색한다(기존 흐름 유지) |
| `/search?q=…` (tab 없음) | 전체(기본정보) | 결과 목록(경력·대표 프로젝트·기술 요약) + 오른쪽 지식 패널(사진, 헤드라인, 연락처, 이력서 PDF) + 관련 질문(FAQ 펼치기) |
| `?tab=career` | 경력사항 | 회사별: 기간, 역할, 한 일 3줄, 숫자 성과, 관련 프로젝트 링크 |
| `?tab=projects` | 프로젝트 | 기존 카드 그리드, 태그·kind 필터(디자인 작업도 여기서 필터), 상세 `/project/:slug` 유지 |
| `?tab=skills` | 기술스택·자격 | 그룹별(프론트/백엔드/DB/기획·디자인/도구) 기술, 사용 기간, 관련 프로젝트 + 자격사항(자격증) |
| `?tab=education` | 학력·교육 | 두 구역: 학력사항(대학·전공) / 교육사항(교육과정) |
| `?tab=etc` | 기타 | 스터디, 클론, 활동 아카이브(기존 study/etc) |

`q`에 직무어(개발자, FDE, PM, PO, 기획, PL, QA)가 들어 있으면 그 렌즈를 쓴다. 전체 탭에 렌즈 칩을 두고, 칩을 누르면 `q`가 바뀐다.

## 관련 코드·현재 구조
- 라우트: `front/src/app/router.tsx` (`/`, `/search`, `/project/:slug`)
- 검색 화면: `front/src/features/projects/pages/SearchPage.tsx`: `tab` 파라미터, `CategoryTabs`, `ProfileCard`, `Chip`, `ProjectCard`를 그대로 재사용한다
- 인트로: `front/src/features/intro/` (`useIntroSequence`, `IntroHeader`): 자동완성 항목을 여기에 추가한다
- 프로필 계약: `mockup/profiles.json` ↔ `back/internal/model/profile.go` ↔ `front/src/features/profile/types`
- 카테고리: `mockup/categories.json` (resume/publishing/design/study/etc)

## 범위
1. **데이터 계약**: 새 컬렉션은 만들지 않고 profile 문서에 배열을 추가한다(API, 핸들러, 레포를 늘리지 않음).
   - `careers[]` {company, role, period{start,end}, summary, highlights[{text, roles[]}], metrics[], projectSlugs[]}
   - `educations[]` {school, major, period, kind(대학/교육과정)}, `certifications[]` {name, issuer, date}
   - `skills[]` {name, group, roles[]}, `faqs[]` {q, a, roles[]}, `headlines` {all, dev, fde, product, qa}, `resumeLinks` {렌즈: url}
   - projects에 `roles[]` 추가
   - mockup, Go model, front 타입·변환(`toProfile`, `toProjectMeta`)을 함께 바꾼다
2. **탭 교체**: categories를 all/career/projects/skills/education/etc로 바꾼다. 기존 프로젝트의 categoryId를 옮긴다(publishing·design→projects, study·etc→etc).
3. **전체 탭**: 결과 목록, 지식 패널(`ProfileCard` 확장), 관련 질문(details/summary).
4. **경력사항 탭, 기술스택·자격 탭, 학력·교육 탭(두 구역), 기타 탭**
5. **직무 렌즈**: `q`에서 렌즈를 뽑는 순수 함수 `lensFromQuery`, 렌즈에 맞는 항목을 먼저 보여 주는 정렬 `byLens` (front util 하나).
6. **인트로 자동완성** 항목을 직무 검색어로 바꾸고, 클릭하면 `/search?q=…`로 이동한다.
7. 콘텐츠 초안: 기존 profile body(브레이스 경력, 8만·26,000건)를 바탕으로 채운다. 학력·자격의 사실 정보는 사용자가 확인하고 고친다.

## 제외 범위
직무별 PDF 제작, 다국어, 로그인·통계 백엔드, 서버 쪽 렌즈 정렬(프론트에서 처리), 디자인 토큰 전면 교체

## 영향 파일
- `mockup/profiles.json`, `mockup/projects.json`, `mockup/categories.json`
- `back/internal/model/profile.go`, `project.go`, `category.go`(필요시), seed 테스트
- `front/src/features/profile/{types,api,components}`, `front/src/features/projects/{pages/SearchPage.tsx,components/CategoryTabs.tsx,types}`
- 새 파일: `front/src/features/search/` 아래 탭 컴포넌트(CareerTab, SkillsTab, EducationTab, EtcTab, RelatedQuestions)와 `lens.ts`
- `front/src/features/intro/` 자동완성
- `front/src/mocks/apiContract.ts`, `docs/PRD.md`(AC-L1 교체, 새 AC 추가), `docs/DECISIONS.md`(렌즈·데이터 결정)

## 위험·호환성
- categoryId가 바뀌면 기존 `?tab=publishing` 같은 링크가 깨진다. 모르는 tab 값은 전체로 보낸다(현재 `isCategory` 동작이 그렇다).
- profile 문서가 커진다. 콘텐츠 양이 적으니 괜찮다. 나중에 편집 기능을 만들 때 컬렉션 분리를 다시 검토한다.
- Go 계약 테스트도 새 필드를 통과해야 한다. Go 필드는 `omitempty` 없이 빈 배열로 내보낸다.

## 테스트 (TDD, 실패하는 테스트 먼저)
- `lens.test.ts`: q에서 렌즈 추출(개발자/FDE/PM·PO·기획·PL/QA/없음), byLens 정렬
- 탭별 컴포넌트 테스트: 경력 항목, 성과, 학력 표시. 모르는 tab은 전체 탭으로
- 인트로: 자동완성 클릭 → `/search?q=정주애 PM`, 자동 진행 → `q=정주애`
- 계약: `apiContract.ts`에 새 필드 검사, `cd back && make test`
- 수동: `npm run dev`(MSW) 브라우저에서 렌즈 4개와 탭 6개 확인, 모바일 폭 확인

## Acceptance Criteria
- AC-IA1: 탭은 전체 / 경력사항 / 프로젝트 / 기술스택·자격 / 학력·교육 / 기타이고, 모든 탭에 내용이 있다. 기술스택·자격 탭 아래에 자격사항 구역이 있고, 학력·교육 탭은 학력사항, 교육사항 두 구역으로 나뉜다.
- AC-IA2: 전체 탭은 결과 목록, 지식 패널(헤드라인, 연락처, 이력서 링크), 관련 질문을 보여 준다.
- AC-IA3: `q`에 직무어가 있으면 헤드라인, 결과 순서, 이력서 링크가 그 렌즈로 바뀐다. 직무어가 없으면 전체 렌즈다.
- AC-IA4: 인트로 자동완성에 직무 검색어 4개가 있고, 하나를 고르면 그 렌즈로 들어간다. 아무것도 하지 않으면 기존처럼 자동 진행한다(AC-U1 유지).
- AC-IA5: 경력 항목은 기간, 역할, 성과를 보여 주고 관련 프로젝트로 링크한다.
- AC-IA6: MSW와 Go API가 계약 테스트를 모두 통과한다.

## Workflow
- type: docs
- issue: none
- title: docs: 검색형 포트폴리오 와이어프레임 HTML 추가
- slug: wireframe
