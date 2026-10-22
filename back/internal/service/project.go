// Package service 는 비즈니스 규칙을 담는다. 저장소는 이 패키지에 정의한 interface 로만 접근한다.
package service

import (
	"context"
	"sort"
	"unicode"

	"golang.org/x/text/collate"
	"golang.org/x/text/language"

	"github.com/jexists/portfolio/back/internal/model"
)

// ProjectStore 는 repo.ProjectRepo 가 구현한다 (테스트에서는 fake 로 대체).
type ProjectStore interface {
	List(ctx context.Context, q model.ProjectQuery) ([]model.Project, error)
	Get(ctx context.Context, id string) (model.Project, error)
}

type ProjectService struct {
	store ProjectStore
}

func NewProjectService(store ProjectStore) *ProjectService {
	return &ProjectService{store: store}
}

func (s *ProjectService) List(ctx context.Context, q model.ProjectQuery) ([]model.Project, error) {
	return s.store.List(ctx, q)
}

func (s *ProjectService) Get(ctx context.Context, id string) (model.Project, error) {
	return s.store.Get(ctx, id)
}

// Tags 는 공개 프로젝트의 태그를 중복 없이 한국어 정렬 순서로 반환한다.
func (s *ProjectService) Tags(ctx context.Context) ([]string, error) {
	projects, err := s.store.List(ctx, model.ProjectQuery{})
	if err != nil {
		return nil, err
	}
	seen := map[string]bool{}
	tags := []string{}
	for _, p := range projects {
		for _, tag := range p.Tags {
			if !seen[tag] {
				seen[tag] = true
				tags = append(tags, tag)
			}
		}
	}
	sortKorean(tags)
	return tags, nil
}

// Series 는 공개 프로젝트를 시리즈별로 묶고, 시리즈와 그 안의 프로젝트를 order 순으로 정렬한다.
func (s *ProjectService) Series(ctx context.Context) ([]model.SeriesGroup, error) {
	projects, err := s.store.List(ctx, model.ProjectQuery{})
	if err != nil {
		return nil, err
	}
	groups := map[string][]model.Project{}
	var names []string
	for _, p := range projects {
		if p.Series == nil {
			continue
		}
		if _, ok := groups[p.Series.Name]; !ok {
			names = append(names, p.Series.Name)
		}
		groups[p.Series.Name] = append(groups[p.Series.Name], p)
	}

	result := make([]model.SeriesGroup, 0, len(names))
	for _, name := range names {
		members := groups[name]
		sort.SliceStable(members, func(i, j int) bool { return members[i].Series.Order < members[j].Series.Order })
		result = append(result, model.SeriesGroup{Name: name, Order: members[0].Series.Order, Projects: members})
	}
	sort.SliceStable(result, func(i, j int) bool {
		if result[i].Order != result[j].Order {
			return result[i].Order < result[j].Order
		}
		return compareKorean(result[i].Name, result[j].Name) < 0
	})
	return result, nil
}

func sortKorean(values []string) {
	sort.SliceStable(values, func(i, j int) bool { return compareKorean(values[i], values[j]) < 0 })
}

// compareKorean 은 브라우저의 localeCompare(…, 'ko') 순서를 맞춘다:
// 숫자·기호 → 한글 → 그 밖의 문자(영문 등). x/text/collate 는 스크립트 재정렬을 하지 않아 직접 순위를 매긴다.
func compareKorean(a, b string) int {
	if ra, rb := scriptRank(a), scriptRank(b); ra != rb {
		return ra - rb
	}
	return collate.New(language.Korean).CompareString(a, b)
}

func scriptRank(s string) int {
	for _, r := range s {
		switch {
		case unicode.IsDigit(r) || unicode.IsPunct(r) || unicode.IsSpace(r) || unicode.IsSymbol(r):
			return 0
		case unicode.Is(unicode.Hangul, r):
			return 1
		default:
			return 2
		}
	}
	return 0
}
