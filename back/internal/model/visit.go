package model

type Visit struct {
	ID        string  `bson:"_id" json:"_id"`
	UserID    *string `bson:"userId" json:"userId"`
	Path      string  `bson:"path" json:"path"`
	VisitedAt string  `bson:"visitedAt" json:"visitedAt"`
}
