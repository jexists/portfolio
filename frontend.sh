#!/usr/bin/env bash
# 프론트 실행: Vite dev 서버 :5173
#   ./frontend.sh           # MSW 목업으로 실행 (백엔드 불필요)
#   ./frontend.sh --api     # 실제 백엔드(localhost:8080) 호출 — ./backend.sh 먼저 실행
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
case "${1:-}" in
  --api) export VITE_USE_MOCK=false ;;
  "") ;;
  *) echo "사용법: $0 [--api]" >&2; exit 1 ;;
esac

command -v npm >/dev/null || { echo "npm 이 없습니다" >&2; exit 1; }
cd "$ROOT/front"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "front/.env 생성 (.env.example 복사)"
fi

# node_modules 가 없거나 package-lock.json 이 더 최신이면 설치
if [[ ! -f node_modules/.package-lock.json || package-lock.json -nt node_modules/.package-lock.json ]]; then
  npm install
fi

echo "모드: $([[ "${VITE_USE_MOCK:-}" == "false" ]] && echo '실제 API' || echo '.env 설정 (기본 MSW 목업)')"
exec npm run dev
