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

// 언어·대표 기술 설명 한 줄 (라벨 + 내용)
type LabeledText struct {
	Label string `bson:"label" json:"label"`
	Text  string `bson:"text" json:"text"`
}

// 기술 탭 맨 위 요점 한 줄: 라벨 + 기술 이름(배지) 목록
type SkillSummaryRow struct {
	Label string   `bson:"label" json:"label"`
	Items []string `bson:"items" json:"items"`
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
	// 기술 탭 맨 위 요점과 맨 아래 언어
	SkillSummary []SkillSummaryRow `bson:"skillSummary" json:"skillSummary"`
	Languages    []LabeledText     `bson:"languages" json:"languages"`
	// 전체 탭 기술 카드의 대표 기술 설명
	SkillHighlights []LabeledText `bson:"skillHighlights" json:"skillHighlights"`
}
