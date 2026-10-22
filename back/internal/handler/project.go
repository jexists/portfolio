package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/model"
)

type ProjectService interface {
	List(ctx context.Context, q model.ProjectQuery) ([]model.Project, error)
	Get(ctx context.Context, id string) (model.Project, error)
	Tags(ctx context.Context) ([]string, error)
	Series(ctx context.Context) ([]model.SeriesGroup, error)
}

type ProjectHandler struct {
	svc ProjectService
}

func NewProjectHandler(svc ProjectService) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

// List GET /projects?category=&tag=&includeDrafts=true
func (h *ProjectHandler) List(c *gin.Context) {
	q := model.ProjectQuery{
		Category:      c.Query("category"),
		Tag:           c.Query("tag"),
		IncludeDrafts: c.Query("includeDrafts") == "true",
	}
	projects, err := h.svc.List(c.Request.Context(), q)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, projects)
}

// Get GET /projects/:slug
func (h *ProjectHandler) Get(c *gin.Context) {
	project, err := h.svc.Get(c.Request.Context(), c.Param("slug"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, project)
}

// Tags GET /tags
func (h *ProjectHandler) Tags(c *gin.Context) {
	tags, err := h.svc.Tags(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, tags)
}

// Series GET /series
func (h *ProjectHandler) Series(c *gin.Context) {
	series, err := h.svc.Series(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, series)
}
