package service

import (
	"context"

	"github.com/jexists/portfolio/back/internal/model"
)

type ProfileStore interface {
	Get(ctx context.Context) (model.Profile, error)
}

type ProfileService struct {
	store ProfileStore
}

func NewProfileService(store ProfileStore) *ProfileService {
	return &ProfileService{store: store}
}

func (s *ProfileService) Get(ctx context.Context) (model.Profile, error) {
	return s.store.Get(ctx)
}
