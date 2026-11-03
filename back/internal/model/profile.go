package model

type Profile struct {
	ID       string   `bson:"_id" json:"_id"`
	Name     string   `bson:"name" json:"name"`
	NameEn   string   `bson:"nameEn" json:"nameEn"`
	Role     string   `bson:"role" json:"role"`
	Location string   `bson:"location" json:"location"`
	KakaoID  string   `bson:"kakaoId" json:"kakaoId"`
	Email    string   `bson:"email" json:"email"`
	Website  string   `bson:"website" json:"website"`
	GitHub   string   `bson:"github" json:"github"`
	Avatar   string   `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Keywords []string `bson:"keywords" json:"keywords"`
	Body     string   `bson:"body" json:"body"`
}
