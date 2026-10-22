package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/model"
)

type CategoryService interface {
	List(ctx context.Context) ([]model.Category, error)
}

type CategoryHandler struct {
	svc CategoryService
}

func NewCategoryHandler(svc CategoryService) *CategoryHandler {
	return &CategoryHandler{svc: svc}
}

// List GET /categories
func (h *CategoryHandler) List(c *gin.Context) {
	categories, err := h.svc.List(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, categories)
}
