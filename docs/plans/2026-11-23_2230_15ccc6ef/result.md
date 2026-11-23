# 구현 결과 — 2026-11-23_2230_15ccc6ef
작성: 2026-11-24 · 기준 커밋: bca4de2..18fa218 (브랜치 `feat/15-career-detail`, Issue #15)

## 1. 변경 파일
83개 파일, +1364 / −344 (`git diff --stat bca4de2..HEAD`, 캡처 이미지 54장 포함).

- 경력 데이터·계약: `mockup/careers.json`(highlight·body), `back/internal/model/resume.go`, `front/src/features/resume/types/resume.types.ts`
- 경력 화면: `front/src/features/resume/components/ResumeSections.*`, `resume/pages/CareerDetailPage.*`(신규), `resume/index.ts`, `app/router.*`, `projects/pages/SearchPage.*`
- 공용 컴포넌트(신규): `components/ui/Markdown.*`, `components/ui/RailButton.*`, `components/layout/SiteFooter.*`, `styles/manifest.json`
- 프로젝트 상세: `projects/pages/ProjectDetailPage.*`(Markdown 분리, 맨 위 스크롤, 풋터)
- 프로필: `profile/components/ProfileCard.*`(핵심 역량 아이콘, 외부 링크 로고)
- 프로젝트 데이터·화면: `mockup/projects.json`(기간·duration·images·대표 변경), `back/internal/model/project.go`, `projects/types/project.types.ts`, `projects/api/projectMapper.ts`, `projects/components/{ProjectCard,ProjectCollections}.*`, `front/public/images/projects/`(신규 14개 폴더)

## 2. 주요 변경 이유
- 경력 탭을 경력기술서(v35) 흐름으로 바꾸고, 브레이스는 프로젝트 문서 전체를 보는 상세 화면을 둔다.
- 상세 문서는 공개 화면이라 원본 md의 "4줄 요약", "면접 예상 질문", 연간 거래액·연매출 줄은 뺐다.
- 화살표 버튼 크기가 화면마다 달라 공용 `RailButton`으로 합쳤다.
- 승인 후 같은 세션에서 받은 피드백(전체 탭 결과 카드 배치·더보기 버튼, 풋터·문의 메일·맨위로, 핵심 역량·링크 아이콘, 대표 프로젝트 카드, 프로젝트 캡처와 기간 표기)도 같은 브랜치에 반영했다.
- 기간은 커밋 날짜를 7일 간격으로 묶어 가장 큰 묶음을 집중 작업 기간으로 잡고, 표시용 `duration` 필드에 둔다(전월세 팩트체커처럼 끝−시작과 다른 경우가 있어 계산하지 않음).

## 3. 테스트·빌드 결과
- `npx vitest run` (front): Test Files 32 passed, Tests 140 passed
- `npm run lint` (front): 오류 0
- `npm run build` (front): 성공 (`built in 6.10s`)
- `make lint` / `make test` / `make build` (back): 통과 (internal/router, internal/service ok)
- 계약 검사 `CONTRACT_API_URL=http://localhost:8089/api/v1 npx vitest run src/mocks/apiContract.test.ts`: 12 passed (로컬 mongod `portfolio_contract` 시드 후, 서버 재시작 뒤 `duration`·`highlight`·`body` 응답 확인)
- 브라우저 확인: 경력 탭·브레이스 상세·해시 이동은 세션 초반에 확인. 이후 디자인 수정분은 사용자가 직접 확인하기로 해서 확인하지 않음.

## 4. 계획 대비 달라진 부분
- 1 타임라인 제목: 완료("주식회사 브레이스 (구 아유레디)").
- 2 전체 탭 경력 카드: 변경 — 사용자 피드백으로 제목 오른쪽 끝에 기간, 아래에 서비스 한 줄과 점 목록(`careers.highlight`), 다른 경력은 "회사 - 직무", 더보기는 카드 하단 가로 버튼.
- 3 경력 탭: 완료. 타임라인은 스크롤바 대신 화살표.
- 4 브레이스 상세: 완료. 매출 수치 두 줄은 배포 전 사용자 확인 후 삭제.
- 계획에 없던 추가: 풋터, RailButton, 핵심 역량·외부 링크 아이콘, 대표 프로젝트 카드 정리, 프로젝트 캡처(14개)와 기간 표기, 프로젝트 상세 맨 위 스크롤, 기존에 깨져 있던 테스트 6개 수정.
- 제외 범위(성진·뉴스게이트 상세, 경력 상세 API): 그대로 미실행. 목록 응답에 body를 함께 보내는 shortcut은 `resume.go`에 주석으로 남김.

## 5. 남은 일
- 캡처 없는 프로젝트: blog2shorts(사이트 Cloudflare 오류), plog(로그인 화면만 공개), SalesLuv, photo_organizer, instpic, 강의 실습.
- 문의는 메일 링크, 나중에 문의 폼으로 교체(`SiteFooter.tsx` 주석).
