// Package middleware 는 모든 요청에 공통으로 적용하는 처리다.
package middleware

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

// CORS 는 허용한 origin(프론트 도메인)에서 온 요청만 브라우저 교차 출처를 허용한다.
func CORS(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" && slices.Contains(allowedOrigins, origin) {
			h := c.Writer.Header()
			h.Set("Access-Control-Allow-Origin", origin)
			h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			h.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			h.Set("Access-Control-Allow-Credentials", "true")
			h.Add("Vary", "Origin")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
