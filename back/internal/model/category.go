package model

type Category struct {
	ID    string `bson:"_id" json:"_id"`
	Label string `bson:"label" json:"label"`
	Order int    `bson:"order" json:"order"`
}
