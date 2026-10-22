package db

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// EnsureIndexes 는 자주 조회하는 필드에 인덱스를 만든다. 여러 번 실행해도 안전하다.
func EnsureIndexes(ctx context.Context, database *mongo.Database) error {
	specs := map[string][]mongo.IndexModel{
		CollProjects: {
			{Keys: bson.D{{Key: "categoryId", Value: 1}}},
			{Keys: bson.D{{Key: "tags", Value: 1}}},
			{Keys: bson.D{{Key: "featured", Value: -1}, {Key: "publishedAt", Value: -1}}},
		},
		CollUsers: {
			{Keys: bson.D{{Key: "provider", Value: 1}, {Key: "providerId", Value: 1}}, Options: options.Index().SetUnique(true)},
		},
		CollVisits: {
			{Keys: bson.D{{Key: "visitedAt", Value: -1}}},
		},
	}
	for coll, models := range specs {
		if _, err := database.Collection(coll).Indexes().CreateMany(ctx, models); err != nil {
			return fmt.Errorf("create indexes on %s: %w", coll, err)
		}
	}
	return nil
}
