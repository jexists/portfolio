package model

type ProfileLink struct {
	Type  string `bson:"type" json:"type"` // github | linkedin | blog | website
	Label string `bson:"label" json:"label"`
	URL   string `bson:"url" json:"url"`
}

type Strength struct {
	Title string `bson:"title" json:"title"`
	Text  string `bson:"text" json:"text"`
}

type Profile struct {
	ID        string        `bson:"_id" json:"_id"`
	Name      string        `bson:"name" json:"name"`
	NameEn    string        `bson:"nameEn" json:"nameEn"`
	Role      string        `bson:"role" json:"role"`
	Years     string        `bson:"years" json:"years"`
	Location  string        `bson:"location" json:"location"`
	Email     string        `bson:"email" json:"email"`
	Avatar    string        `bson:"avatar" json:"avatar"`
	Headline  string        `bson:"headline" json:"headline"`
	Summary   []string      `bson:"summary" json:"summary"`
	Links     []ProfileLink `bson:"links" json:"links"`
	Strengths []Strength    `bson:"strengths" json:"strengths"`
}
