// Package handler 는 HTTP 요청 파싱과 응답 작성만 맡는다. 규칙은 service 에 있다.
package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/jexists/portfolio/back/internal/model"
)

// ErrorBody 는 모든 에러 응답 형식이다 (front/src/types/api.types.ts 와 같다).
type ErrorBody struct {
	Error ErrorDetail `json:"error"`
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func respondError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, model.ErrNotFound):
		c.JSON(http.StatusNotFound, ErrorBody{ErrorDetail{"NOT_FOUND", "리소스를 찾을 수 없습니다"}})
	case errors.Is(err, model.ErrInvalid):
		c.JSON(http.StatusBadRequest, ErrorBody{ErrorDetail{"BAD_REQUEST", err.Error()}})
	default:
		log.Printf("internal error on %s %s: %v", c.Request.Method, c.FullPath(), err)
		c.JSON(http.StatusInternalServerError, ErrorBody{ErrorDetail{"INTERNAL", "서버 오류가 발생했습니다"}})
	}
}
