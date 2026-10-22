package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/model"
)

type ProfileService interface {
	Get(ctx context.Context) (model.Profile, error)
}

type ProfileHandler struct {
	svc ProfileService
}

func NewProfileHandler(svc ProfileService) *ProfileHandler {
	return &ProfileHandler{svc: svc}
}

// Get GET /profile
func (h *ProfileHandler) Get(c *gin.Context) {
	profile, err := h.svc.Get(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, profile)
}
