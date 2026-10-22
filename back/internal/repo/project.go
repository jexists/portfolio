// Package repo 는 컬렉션별 MongoDB 쿼리를 담당한다. 비즈니스 규칙은 service 에 둔다.
package repo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/model"
)

type ProjectRepo struct {
	coll *mongo.Collection
}

func NewProjectRepo(database *mongo.Database) *ProjectRepo {
	return &ProjectRepo{coll: database.Collection(db.CollProjects)}
}

// List 는 featured 우선, publishedAt 내림차순으로 반환하며 본문(body)은 제외한다.
func (r *ProjectRepo) List(ctx context.Context, q model.ProjectQuery) ([]model.Project, error) {
	filter := bson.M{}
	if !q.IncludeDrafts {
		filter["draft"] = bson.M{"$ne": true}
	}
	if q.Category != "" {
		filter["categoryId"] = q.Category
	}
	if q.Tag != "" {
		filter["tags"] = q.Tag
	}
	opts := options.Find().
		SetSort(bson.D{{Key: "featured", Value: -1}, {Key: "publishedAt", Value: -1}}).
		SetProjection(bson.M{"body": 0})

	cur, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	projects := []model.Project{}
	if err := cur.All(ctx, &projects); err != nil {
		return nil, err
	}
	return projects, nil
}

func (r *ProjectRepo) Get(ctx context.Context, id string) (model.Project, error) {
	var project model.Project
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&project)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return model.Project{}, model.ErrNotFound
	}
	return project, err
}
