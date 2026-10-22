package service

import (
	"context"

	"github.com/jexists/portfolio/back/internal/model"
)

type CategoryStore interface {
	List(ctx context.Context) ([]model.Category, error)
}

type CategoryService struct {
	store CategoryStore
}

func NewCategoryService(store CategoryStore) *CategoryService {
	return &CategoryService{store: store}
}

func (s *CategoryService) List(ctx context.Context) ([]model.Category, error) {
	return s.store.List(ctx)
}
