#!/usr/bin/env bash
# 백엔드 실행: MongoDB(docker) → (선택) 시드 → Go API :8080
#   ./backend.sh            # Mongo 띄우고 API 실행
#   ./backend.sh --seed     # mockup → MongoDB 시드 후 실행
#   ./backend.sh --reset    # 컬렉션 비우고 다시 시드한 뒤 실행
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SEED=""
case "${1:-}" in
  --seed) SEED="seed" ;;
  --reset) SEED="seed-reset" ;;
  "") ;;
  *) echo "사용법: $0 [--seed|--reset]" >&2; exit 1 ;;
esac

command -v go >/dev/null || { echo "go 가 없습니다" >&2; exit 1; }
command -v docker >/dev/null || { echo "docker 가 없습니다" >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker 데몬이 꺼져 있습니다. Docker Desktop 을 켜 주세요" >&2; exit 1; }

if [[ ! -f "$ROOT/back/.env" ]]; then
  cp "$ROOT/back/.env.example" "$ROOT/back/.env"
  echo "back/.env 생성 (.env.example 복사)"
fi

echo "MongoDB 시작 (localhost:27018)..."
docker compose -f "$ROOT/docker-compose.yml" up -d mongo
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' portfolio-mongo 2>/dev/null || true)"
  [[ "$status" == "healthy" ]] && break
  sleep 1
done
[[ "${status:-}" == "healthy" ]] || { echo "MongoDB 가 healthy 상태가 되지 않았습니다" >&2; exit 1; }

cd "$ROOT/back"
if [[ -n "$SEED" ]]; then
  make "$SEED"
fi

echo "API 실행 → http://localhost:8080"
exec make run
