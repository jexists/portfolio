package model

import "errors"

// 계층 사이에서 공유하는 오류. handler 가 HTTP 상태 코드로 바꾼다.
var (
	ErrNotFound = errors.New("not found")
	ErrInvalid  = errors.New("invalid input")
)

// ProjectQuery 는 프로젝트 목록 조회 조건이다.
type ProjectQuery struct {
	Category      string
	Tag           string
	IncludeDrafts bool
}
