// Package router 는 API 경로를 등록한다. 모든 경로는 /api/v1 아래에 둔다.
package router

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/handler"
	"github.com/jexists/portfolio/back/internal/middleware"
)

type Deps struct {
	Projects       *handler.ProjectHandler
	Profile        *handler.ProfileHandler
	Categories     *handler.CategoryHandler
	Ping           func(ctx context.Context) error
	CORSOrigins    []string
	RequestTimeout time.Duration
}

func New(d Deps) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.CORS(d.CORSOrigins), middleware.Timeout(d.RequestTimeout))

	v1 := r.Group("/api/v1")
	v1.GET("/health", handler.Health(d.Ping))
	v1.GET("/profile", d.Profile.Get)
	v1.GET("/categories", d.Categories.List)
	v1.GET("/projects", d.Projects.List)
	v1.GET("/projects/:slug", d.Projects.Get)
	v1.GET("/tags", d.Projects.Tags)
	v1.GET("/series", d.Projects.Series)
	return r
}
