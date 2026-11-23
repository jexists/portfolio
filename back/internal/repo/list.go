package repo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ListRepo 는 order 오름차순 전체 목록만 읽는 컬렉션(이력 컬렉션)에 쓴다.
type ListRepo[T any] struct {
	coll *mongo.Collection
}

func NewListRepo[T any](database *mongo.Database, collection string) *ListRepo[T] {
	return &ListRepo[T]{coll: database.Collection(collection)}
}

func (r *ListRepo[T]) List(ctx context.Context) ([]T, error) {
	cur, err := r.coll.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "order", Value: 1}}))
	if err != nil {
		return nil, err
	}
	items := []T{}
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}
