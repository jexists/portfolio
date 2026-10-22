# back/ 지침

Go 1.26(go.mod, `GOTOOLCHAIN=auto`가 자동 설치) · Gin · mongo-driver v2

## 명령어 (back/ 에서, `.env`가 있으면 Makefile이 읽음)
```bash
make run          # :8080
make test         # go test ./...
make lint         # gofmt 검사 + go vet
make seed         # ../mockup/*.json → 컬렉션 upsert (make seed-reset: 비우고 다시)
make build        # bin/server, bin/seed
```

## 구조 규칙
- `cmd/<이름>/main.go`는 조립만 한다. 로직은 `internal/`에 둔다.
- 요청 흐름: `router` → `middleware` → `handler`(파싱·응답) → `service`(규칙) → `repo`(Mongo 쿼리) → MongoDB.
- 의존 방향은 한쪽으로만 흐른다. **interface는 쓰는 쪽에 정의한다**: service가 `ProjectStore` 등을 정의하고 repo가 구현한다. handler도 자기가 쓰는 service interface를 정의한다. 테스트에서는 fake를 넣는다.
- `model/`은 컬렉션 문서 구조이며 `mockup/*.json`과 1:1이다. 공통 오류 `model.ErrNotFound`, `model.ErrInvalid`는 handler가 404/400으로 바꾸고, 그 밖의 오류는 500으로 바꾸며 내부 메시지를 숨긴다.
- 에러 응답 형식: `{"error":{"code","message"}}` (front `src/types/api.types.ts`와 같다).
- 모든 Mongo 호출은 요청 context(`middleware.Timeout`)나 `context.WithTimeout`을 쓴다.
- 목록 응답에서는 `body`를 projection으로 뺀다. 정렬은 featured 우선, publishedAt 내림차순이다. 태그와 시리즈 이름은 한국어 순서(한글 → 영문)로 정렬한다.
- API 동작을 바꾸면 front MSW(`front/src/mocks/queries.ts`)도 같이 바꾸고 계약 테스트를 실제 API로 돌린다.
