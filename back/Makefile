# back/.env 가 있으면 환경변수로 읽는다
ifneq (,$(wildcard ./.env))
include .env
export
endif

.PHONY: run dev test vet lint build seed seed-reset

run:        ## 서버 실행
	go run ./cmd/server

dev:        ## hot reload (air 필요: go install github.com/air-verse/air@latest)
	air

test:       ## 단위 테스트
	go test ./...

vet:
	go vet ./...

lint: vet   ## gofmt 검사 + vet
	@test -z "$$(gofmt -l .)" || (gofmt -l . && exit 1)

build:      ## bin/server, bin/seed
	go build -o bin/ ./cmd/...

seed:       ## ../mockup/*.json → MongoDB upsert
	go run ./cmd/seed

seed-reset: ## 컬렉션을 비우고 다시 시드
	go run ./cmd/seed -drop
