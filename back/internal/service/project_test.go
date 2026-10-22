package service

import (
	"context"
	"errors"
	"reflect"
	"testing"

	"github.com/jexists/portfolio/back/internal/model"
)

// fakeProjectStore 는 repo 의 정렬·필터 규칙을 흉내 낸다 (featured 우선, publishedAt 내림차순, draft 제외).
type fakeProjectStore struct {
	projects []model.Project
	lastList model.ProjectQuery
}

func (f *fakeProjectStore) List(_ context.Context, q model.ProjectQuery) ([]model.Project, error) {
	f.lastList = q
	out := []model.Project{}
	for _, p := range f.projects {
		if !q.IncludeDrafts && p.Draft {
			continue
		}
		out = append(out, p)
	}
	return out, nil
}

func (f *fakeProjectStore) Get(_ context.Context, id string) (model.Project, error) {
	for _, p := range f.projects {
		if p.ID == id {
			return p, nil
		}
	}
	return model.Project{}, model.ErrNotFound
}

func sampleProjects() []model.Project {
	return []model.Project{
		{ID: "asiana-clone", Tags: []string{"HTML", "SCSS", "반응형"}, Series: &model.Series{Name: "클론 코딩", Order: 2}},
		{ID: "naver-clone", Tags: []string{"HTML", "SCSS"}, Series: &model.Series{Name: "클론 코딩", Order: 1}},
		{ID: "paint-app", Tags: []string{"Canvas", "그래픽디자인"}},
		{ID: "draft", Tags: []string{"준비중"}, Draft: true, Series: &model.Series{Name: "숨김", Order: 0}},
	}
}

func TestProjectService_ListPassesQuery(t *testing.T) {
	store := &fakeProjectStore{projects: sampleProjects()}
	svc := NewProjectService(store)
	q := model.ProjectQuery{Category: "publishing", Tag: "SCSS", IncludeDrafts: true}

	if _, err := svc.List(context.Background(), q); err != nil {
		t.Fatal(err)
	}
	if store.lastList != q {
		t.Fatalf("query = %+v, want %+v", store.lastList, q)
	}
}

func TestProjectService_GetNotFound(t *testing.T) {
	svc := NewProjectService(&fakeProjectStore{projects: sampleProjects()})

	_, err := svc.Get(context.Background(), "missing")
	if !errors.Is(err, model.ErrNotFound) {
		t.Fatalf("err = %v, want ErrNotFound", err)
	}
}

func TestProjectService_TagsUniqueKoreanFirstWithoutDrafts(t *testing.T) {
	svc := NewProjectService(&fakeProjectStore{projects: sampleProjects()})

	tags, err := svc.Tags(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	// 프론트(MSW)의 localeCompare('ko') 와 같은 순서: 한글 먼저, 그다음 영문
	want := []string{"그래픽디자인", "반응형", "Canvas", "HTML", "SCSS"}
	if !reflect.DeepEqual(tags, want) {
		t.Fatalf("tags = %v, want %v", tags, want)
	}
}

func TestProjectService_SeriesGroupedAndOrdered(t *testing.T) {
	svc := NewProjectService(&fakeProjectStore{projects: sampleProjects()})

	series, err := svc.Series(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if len(series) != 1 || series[0].Name != "클론 코딩" || series[0].Order != 1 {
		t.Fatalf("series = %+v", series)
	}
	got := []string{series[0].Projects[0].ID, series[0].Projects[1].ID}
	if !reflect.DeepEqual(got, []string{"naver-clone", "asiana-clone"}) {
		t.Fatalf("series order = %v", got)
	}
}
