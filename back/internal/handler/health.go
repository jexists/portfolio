package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health GET /health — DB 까지 살아 있는지 확인한다.
func Health(ping func(ctx context.Context) error) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "degraded", "db": "down"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "db": "up"})
	}
}
