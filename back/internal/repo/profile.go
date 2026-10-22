package repo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/model"
)

type ProfileRepo struct {
	coll *mongo.Collection
}

func NewProfileRepo(database *mongo.Database) *ProfileRepo {
	return &ProfileRepo{coll: database.Collection(db.CollProfiles)}
}

// Get 은 포트폴리오 주인 프로필(문서 1개)을 반환한다.
func (r *ProfileRepo) Get(ctx context.Context) (model.Profile, error) {
	var profile model.Profile
	err := r.coll.FindOne(ctx, bson.M{}).Decode(&profile)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.Profile{}, model.ErrNotFound
	}
	return profile, err
}
