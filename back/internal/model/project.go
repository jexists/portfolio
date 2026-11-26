// Package model 은 컬렉션별 문서 구조다. 필드는 mockup/*.json 과 1:1 로 맞춘다.
package model

type Series struct {
	Name  string `bson:"name" json:"name"`
	Order int    `bson:"order" json:"order"`
}

type ProjectLink struct {
	Type  string `bson:"type" json:"type"` // live | github | slides | video | doc | pdf
	Label string `bson:"label" json:"label"`
	URL   string `bson:"url" json:"url"`
}

type ProjectImage struct {
	Src     string `bson:"src" json:"src"`
	Caption string `bson:"caption" json:"caption"`
}

type Project struct {
	ID          string         `bson:"_id" json:"_id"`
	Title       string         `bson:"title" json:"title"`
	Subtitle    string         `bson:"subtitle" json:"subtitle"`
	CategoryID  string         `bson:"categoryId" json:"categoryId"`
	Kind        string         `bson:"kind,omitempty" json:"kind,omitempty"`
	Course      string         `bson:"course" json:"course"`
	Period      Period         `bson:"period" json:"period"`
	Duration    string         `bson:"duration" json:"duration"` // 집중해서 작업한 기간 (하루·이틀·N일·N주·N개월)
	Summary     string         `bson:"summary" json:"summary"`
	Tags        []string       `bson:"tags" json:"tags"`
	Team        string         `bson:"team" json:"team"`
	Role        string         `bson:"role" json:"role"`
	Highlights  []string       `bson:"highlights" json:"highlights"`
	Links       []ProjectLink  `bson:"links" json:"links"`
	LinkNote    string         `bson:"linkNote" json:"linkNote"`
	LinkStatus  string         `bson:"linkStatus,omitempty" json:"linkStatus,omitempty"` // 링크 카드 제목 옆 작은 상태 (예: 배포 종료)
	Images      []ProjectImage `bson:"images" json:"images"`
	Series      *Series        `bson:"series,omitempty" json:"series,omitempty"`
	PublishedAt string         `bson:"publishedAt" json:"publishedAt"`
	Featured    bool           `bson:"featured" json:"featured"`
	Recommend   int            `bson:"recommend,omitempty" json:"recommend,omitempty"` // 추천순 점수, 클수록 위
	Draft       bool           `bson:"draft" json:"draft"`
	// Body 는 상세 조회에만 채워진다 (목록에서는 projection 으로 제외).
	Body string `bson:"body,omitempty" json:"body,omitempty"`
}

// SeriesGroup 은 /series 응답이다 (컬렉션이 아니라 projects 에서 계산).
type SeriesGroup struct {
	Name     string    `json:"name"`
	Order    int       `json:"order"`
	Projects []Project `json:"projects"`
}
