package model

// 이력 컬렉션(careers, skills, educations, credentials) 문서. mockup/*.json 과 1:1 이다.
// 선택 문자열은 빈 문자열로, 배열은 빈 배열로 내보낸다 (프론트가 빈 값을 숨긴다).

type Period struct {
	Start string `bson:"start" json:"start"`
	End   string `bson:"end" json:"end"`
}

type CareerMetric struct {
	Value string `bson:"value" json:"value"`
	Label string `bson:"label" json:"label"`
	Note  string `bson:"note" json:"note"`
}

type CareerAchievement struct {
	Title    string   `bson:"title" json:"title"`
	Period   string   `bson:"period" json:"period"`
	Role     string   `bson:"role" json:"role"`
	Work     []string `bson:"work" json:"work"`
	Problems []string `bson:"problems" json:"problems"`
	Result   string   `bson:"result" json:"result"`
}

type Career struct {
	ID               string              `bson:"_id" json:"_id"`
	Order            int                 `bson:"order" json:"order"`
	Company          string              `bson:"company" json:"company"`
	CompanyNote      string              `bson:"companyNote" json:"companyNote"`
	SummaryLine      string              `bson:"summaryLine" json:"summaryLine"` // 인물정보 카드 한 줄 요약(회사 + 직무), 비면 company + role
	Period           Period              `bson:"period" json:"period"`
	Duration         string              `bson:"duration" json:"duration"`
	Role             string              `bson:"role" json:"role"`
	Service          string              `bson:"service" json:"service"`
	Responsibilities []string            `bson:"responsibilities" json:"responsibilities"`
	Metrics          []CareerMetric      `bson:"metrics" json:"metrics"`
	Achievements     []CareerAchievement `bson:"achievements" json:"achievements"`
	Extras           []string            `bson:"extras" json:"extras"`
	SkillIDs         []string            `bson:"skillIds" json:"skillIds"`
	Minor            bool                `bson:"minor" json:"minor"`
}

type Skill struct {
	ID         string   `bson:"_id" json:"_id"`
	Order      int      `bson:"order" json:"order"`
	Name       string   `bson:"name" json:"name"`
	Group      string   `bson:"group" json:"group"`
	Usage      string   `bson:"usage" json:"usage"` // work | project | study
	Context    string   `bson:"context" json:"context"`
	ProjectIDs []string `bson:"projectIds" json:"projectIds"`
	CareerIDs  []string `bson:"careerIds" json:"careerIds"`
}

type Education struct {
	ID    string `bson:"_id" json:"_id"`
	Kind  string `bson:"kind" json:"kind"` // degree | course | school
	Order int    `bson:"order" json:"order"`
	Name  string `bson:"name" json:"name"`
	// 인물정보 카드 한 줄 요약, 비면 name + 전공 + 상태
	SummaryLine string   `bson:"summaryLine" json:"summaryLine"`
	Org         string   `bson:"org" json:"org"`
	Major       string   `bson:"major" json:"major"`
	Degree      string   `bson:"degree" json:"degree"`
	Period      Period   `bson:"period" json:"period"`
	Hours       string   `bson:"hours" json:"hours"`
	Notes       []string `bson:"notes" json:"notes"`
	Featured    bool     `bson:"featured" json:"featured"`     // 교육 "중요" 필터에 보일 과정
	ProjectIDs  []string `bson:"projectIds" json:"projectIds"` // 이 과정에서 만든 프로젝트
}

type Credential struct {
	ID     string `bson:"_id" json:"_id"`
	Kind   string `bson:"kind" json:"kind"` // certificate | award
	Order  int    `bson:"order" json:"order"`
	Name   string `bson:"name" json:"name"`
	Issuer string `bson:"issuer" json:"issuer"`
	Date   string `bson:"date" json:"date"`
	Note   string `bson:"note" json:"note"`
}
