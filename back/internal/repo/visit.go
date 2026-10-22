package repo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/model"
)

// VisitRepo 는 /admin 방문 통계용 기록을 저장한다.
type VisitRepo struct {
	coll *mongo.Collection
}

func NewVisitRepo(database *mongo.Database) *VisitRepo {
	return &VisitRepo{coll: database.Collection(db.CollVisits)}
}

func (r *VisitRepo) Insert(ctx context.Context, visit model.Visit) error {
	_, err := r.coll.InsertOne(ctx, visit)
	return err
}
