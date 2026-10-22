package repo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/model"
)

// UserRepo 는 소셜 로그인 사용자를 다룬다. 인증 방식이 정해지면 service/auth.go 에서 사용한다.
type UserRepo struct {
	coll *mongo.Collection
}

func NewUserRepo(database *mongo.Database) *UserRepo {
	return &UserRepo{coll: database.Collection(db.CollUsers)}
}

func (r *UserRepo) FindByProvider(ctx context.Context, provider, providerID string) (model.User, error) {
	var user model.User
	err := r.coll.FindOne(ctx, bson.M{"provider": provider, "providerId": providerID}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.User{}, model.ErrNotFound
	}
	return user, err
}
