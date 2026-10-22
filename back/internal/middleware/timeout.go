package middleware

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
)

// Timeout 은 요청 context 에 제한 시간을 건다. repo 의 모든 Mongo 호출이 이 context 를 쓴다.
func Timeout(d time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), d)
		defer cancel()
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}
