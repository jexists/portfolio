package repo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/model"
)

type CategoryRepo struct {
	coll *mongo.Collection
}

func NewCategoryRepo(database *mongo.Database) *CategoryRepo {
	return &CategoryRepo{coll: database.Collection(db.CollCategories)}
}

func (r *CategoryRepo) List(ctx context.Context) ([]model.Category, error) {
	cur, err := r.coll.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "order", Value: 1}}))
	if err != nil {
		return nil, err
	}
	categories := []model.Category{}
	if err := cur.All(ctx, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}
