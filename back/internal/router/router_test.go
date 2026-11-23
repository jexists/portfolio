package router

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/handler"
	"github.com/jexists/portfolio/back/internal/model"
)

type fakeProjects struct{ lastQuery model.ProjectQuery }

func (f *fakeProjects) List(_ context.Context, q model.ProjectQuery) ([]model.Project, error) {
	f.lastQuery = q
	return []model.Project{{ID: "naver-clone", Title: "네이버"}}, nil
}
func (f *fakeProjects) Get(_ context.Context, id string) (model.Project, error) {
	if id == "naver-clone" {
		return model.Project{ID: id, Body: "## 개요"}, nil
	}
	return model.Project{}, model.ErrNotFound
}
func (f *fakeProjects) Tags(context.Context) ([]string, error) { return nil, errors.New("db down") }
func (f *fakeProjects) Series(context.Context) ([]model.SeriesGroup, error) {
	return []model.SeriesGroup{}, nil
}

type fakeProfile struct{}

func (fakeProfile) Get(context.Context) (model.Profile, error) {
	return model.Profile{Name: "정주애"}, nil
}

type fakeCategories struct{}

func (fakeCategories) List(context.Context) ([]model.Category, error) { return []model.Category{}, nil }

// fakeList 는 목록 service 의 fake 다. err 가 있으면 그 오류를 돌려준다.
type fakeList[T any] struct {
	items []T
	err   error
}

func (f fakeList[T]) List(context.Context) ([]T, error) { return f.items, f.err }

func newTestRouter(projects *fakeProjects, ping func(context.Context) error) *gin.Engine {
	gin.SetMode(gin.TestMode)
	return New(Deps{
		Projects:       handler.NewProjectHandler(projects),
		Profile:        handler.NewProfileHandler(fakeProfile{}),
		Categories:     handler.NewCategoryHandler(fakeCategories{}),
		Careers:        handler.List[model.Career](fakeList[model.Career]{items: []model.Career{{ID: "brace", Company: "주식회사 브레이스"}}}),
		Skills:         handler.List[model.Skill](fakeList[model.Skill]{items: []model.Skill{}}),
		Educations:     handler.List[model.Education](fakeList[model.Education]{err: errors.New("db down")}),
		Credentials:    handler.List[model.Credential](fakeList[model.Credential]{items: []model.Credential{}}),
		Ping:           ping,
		CORSOrigins:    []string{"http://localhost:5173"},
		RequestTimeout: time.Second,
	})
}

func do(r http.Handler, method, path string, header map[string]string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	for k, v := range header {
		req.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func okPing(context.Context) error { return nil }

func TestProjectsListParsesQuery(t *testing.T) {
	projects := &fakeProjects{}
	w := do(newTestRouter(projects, okPing), http.MethodGet, "/api/v1/projects?category=edu&tag=React&includeDrafts=true", nil)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d", w.Code)
	}
	want := model.ProjectQuery{Category: "edu", Tag: "React", IncludeDrafts: true}
	if projects.lastQuery != want {
		t.Fatalf("query = %+v, want %+v", projects.lastQuery, want)
	}
}

func TestProjectGetNotFoundUsesErrorBody(t *testing.T) {
	w := do(newTestRouter(&fakeProjects{}, okPing), http.MethodGet, "/api/v1/projects/missing", nil)

	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d", w.Code)
	}
	var body handler.ErrorBody
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil || body.Error.Code != "NOT_FOUND" {
		t.Fatalf("body = %s (%v)", w.Body.String(), err)
	}
}

func TestInternalErrorHidesDetails(t *testing.T) {
	w := do(newTestRouter(&fakeProjects{}, okPing), http.MethodGet, "/api/v1/tags", nil)

	if w.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d", w.Code)
	}
	if got := w.Body.String(); contains(got, "db down") {
		t.Fatalf("internal error leaked: %s", got)
	}
}

func TestHealthReportsDatabaseDown(t *testing.T) {
	w := do(newTestRouter(&fakeProjects{}, func(context.Context) error { return errors.New("x") }), http.MethodGet, "/api/v1/health", nil)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d", w.Code)
	}
}

func TestCORSAllowsOnlyConfiguredOrigin(t *testing.T) {
	r := newTestRouter(&fakeProjects{}, okPing)

	allowed := do(r, http.MethodOptions, "/api/v1/projects", map[string]string{"Origin": "http://localhost:5173"})
	if allowed.Code != http.StatusNoContent || allowed.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatalf("allowed preflight: %d %v", allowed.Code, allowed.Header())
	}
	denied := do(r, http.MethodGet, "/api/v1/projects", map[string]string{"Origin": "https://evil.example"})
	if denied.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("unexpected CORS header for unknown origin")
	}
}

func TestResumeListsReturnArrays(t *testing.T) {
	r := newTestRouter(&fakeProjects{}, okPing)
	w := do(r, http.MethodGet, "/api/v1/careers", nil)
	if w.Code != http.StatusOK || !contains(w.Body.String(), `"company":"주식회사 브레이스"`) {
		t.Fatalf("careers: %d %s", w.Code, w.Body.String())
	}
	for _, path := range []string{"/api/v1/skills", "/api/v1/credentials"} {
		w := do(r, http.MethodGet, path, nil)
		if w.Code != http.StatusOK || strings.TrimSpace(w.Body.String()) != "[]" {
			t.Fatalf("%s: %d %s", path, w.Code, w.Body.String())
		}
	}
}

func TestResumeListErrorHidesDetails(t *testing.T) {
	w := do(newTestRouter(&fakeProjects{}, okPing), http.MethodGet, "/api/v1/educations", nil)
	if w.Code != http.StatusInternalServerError || contains(w.Body.String(), "db down") {
		t.Fatalf("educations: %d %s", w.Code, w.Body.String())
	}
}

func contains(s, sub string) bool { return strings.Contains(s, sub) }
