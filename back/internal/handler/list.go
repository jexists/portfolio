package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ListService[T any] interface {
	List(ctx context.Context) ([]T, error)
}

// List 는 GET 목록 핸들러를 만든다 (careers, skills, educations, credentials).
func List[T any](svc ListService[T]) gin.HandlerFunc {
	return func(c *gin.Context) {
		items, err := svc.List(c.Request.Context())
		if err != nil {
			respondError(c, err)
			return
		}
		c.JSON(http.StatusOK, items)
	}
}
