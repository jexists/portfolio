package model

type User struct {
	ID         string  `bson:"_id" json:"_id"`
	Name       string  `bson:"name" json:"name"`
	Provider   string  `bson:"provider" json:"provider"`     // kakao | github
	ProviderID string  `bson:"providerId" json:"providerId"` // 제공자 쪽 사용자 ID
	Role       string  `bson:"role" json:"role"`             // admin | user
	Purpose    *string `bson:"purpose" json:"purpose"`       // recruiter | developer | student | visitor
	CreatedAt  string  `bson:"createdAt" json:"createdAt"`
}
