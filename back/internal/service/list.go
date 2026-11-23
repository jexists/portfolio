package service

import "context"

// ListStore 는 정렬된 전체 목록을 주는 저장소다 (repo.ListRepo 가 구현).
type ListStore[T any] interface {
	List(ctx context.Context) ([]T, error)
}

// ListService 는 이력 컬렉션 목록이다. 지금은 규칙이 없어 저장소 결과를 그대로 돌려준다.
type ListService[T any] struct {
	store ListStore[T]
}

func NewListService[T any](store ListStore[T]) *ListService[T] {
	return &ListService[T]{store: store}
}

func (s *ListService[T]) List(ctx context.Context) ([]T, error) {
	return s.store.List(ctx)
}
