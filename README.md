# portfolio

"검색엔진에서 정주애를 검색한다" 컨셉의 개인 포트폴리오. React + Go(Gin) + MongoDB.

배포: https://jexists.github.io/portfolio/ (GitHub Pages, 프론트 + MSW 목업. main에 merge되면 자동 배포)

## 빠른 시작
```bash
# 1) 프론트만 (백엔드 없이 MSW 목업으로 동작)
cd front && npm install && npm run dev          # http://localhost:5173

# 2) 백엔드까지
docker compose up -d                            # MongoDB 7 (localhost:27018)
cd back && cp .env.example .env && make seed    # mockup/*.json → MongoDB
make run                                        # http://localhost:8080/api/v1/health
# 프론트를 실제 API로: front/.env 에 VITE_USE_MOCK=false, VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## 폴더
| 경로 | 내용 |
|---|---|
| `front/` | Vite + React 19 + TypeScript, feature 기반 구조, React Query, MSW |
| `back/` | Go + Gin, `cmd/`(server, seed) + `internal/`(handler → service → repo) |
| `mockup/` | 컬렉션별 JSON — 프론트 목업이자 DB 시드이자 API 계약 |
| `docs/` | [PRD](docs/PRD.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) · [DECISIONS](docs/DECISIONS.md) · [PROGRESS](docs/PROGRESS.md) · [plans](docs/plans/README.md) |
| `design/`, `reference/` | 시안, 참고 자료 |

## AI 개발 환경 (Claude Code + Codex)
- 공통 지침: [AGENTS.md](AGENTS.md) (Claude는 [CLAUDE.md](CLAUDE.md)에서 import)
- 공용 스킬: `.agents/skills/` — `session-start`, `session-wrapup`, `plan-report`
- Claude Plan Mode에서 승인된 계획은 `docs/plans/`에 자동 보관된다.
