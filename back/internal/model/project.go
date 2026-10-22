// Package model 은 컬렉션별 문서 구조다. 필드는 mockup/*.json 과 1:1 로 맞춘다.
package model

type Series struct {
	Name  string `bson:"name" json:"name"`
	Order int    `bson:"order" json:"order"`
}

type Project struct {
	ID          string   `bson:"_id" json:"_id"`
	Title       string   `bson:"title" json:"title"`
	CategoryID  string   `bson:"categoryId" json:"categoryId"`
	Kind        string   `bson:"kind,omitempty" json:"kind,omitempty"`
	Summary     string   `bson:"summary" json:"summary"`
	Tags        []string `bson:"tags" json:"tags"`
	Series      *Series  `bson:"series,omitempty" json:"series,omitempty"`
	PublishedAt string   `bson:"publishedAt" json:"publishedAt"`
	Thumbnail   string   `bson:"thumbnail,omitempty" json:"thumbnail,omitempty"`
	Link        string   `bson:"link,omitempty" json:"link,omitempty"`
	GitHub      string   `bson:"github,omitempty" json:"github,omitempty"`
	Featured    bool     `bson:"featured" json:"featured"`
	Draft       bool     `bson:"draft" json:"draft"`
	// Body 는 상세 조회에만 채워진다 (목록에서는 projection 으로 제외).
	Body string `bson:"body,omitempty" json:"body,omitempty"`
}

// SeriesGroup 은 /series 응답이다 (컬렉션이 아니라 projects 에서 계산).
type SeriesGroup struct {
	Name     string    `json:"name"`
	Order    int       `json:"order"`
	Projects []Project `json:"projects"`
}
