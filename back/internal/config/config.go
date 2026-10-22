// Package config 는 환경변수에서 서버 설정을 읽는다. 비밀값은 .env(커밋 금지)에만 둔다.
package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	Port           string
	MongoURI       string
	MongoDB        string
	CORSOrigins    []string
	RequestTimeout time.Duration
}

func Load() Config {
	return Config{
		Port:           getenv("PORT", "8080"),
		MongoURI:       getenv("MONGO_URI", "mongodb://localhost:27018"),
		MongoDB:        getenv("MONGO_DB", "portfolio"),
		CORSOrigins:    splitList(getenv("CORS_ORIGINS", "http://localhost:5173")),
		RequestTimeout: 5 * time.Second,
	}
}

func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func splitList(v string) []string {
	var out []string
	for _, item := range strings.Split(v, ",") {
		if item = strings.TrimSpace(item); item != "" {
			out = append(out, item)
		}
	}
	return out
}
