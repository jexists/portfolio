// 서버 실행: config → MongoDB 연결 → 인덱스 → 계층 조립(repo → service → handler) → HTTP.
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo/readpref"

	"github.com/jexists/portfolio/back/internal/config"
	"github.com/jexists/portfolio/back/internal/db"
	"github.com/jexists/portfolio/back/internal/handler"
	"github.com/jexists/portfolio/back/internal/repo"
	"github.com/jexists/portfolio/back/internal/router"
	"github.com/jexists/portfolio/back/internal/service"
)

func main() {
	cfg := config.Load()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	client, err := db.Connect(ctx, cfg.MongoURI)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	defer func() {
		if err := db.Disconnect(client); err != nil {
			log.Printf("mongo disconnect: %v", err)
		}
	}()
	database := client.Database(cfg.MongoDB)
	if err := db.EnsureIndexes(ctx, database); err != nil {
		log.Fatalf("indexes: %v", err)
	}

	engine := router.New(router.Deps{
		Projects:   handler.NewProjectHandler(service.NewProjectService(repo.NewProjectRepo(database))),
		Profile:    handler.NewProfileHandler(service.NewProfileService(repo.NewProfileRepo(database))),
		Categories: handler.NewCategoryHandler(service.NewCategoryService(repo.NewCategoryRepo(database))),
		Ping: func(ctx context.Context) error {
			return client.Ping(ctx, readpref.Primary())
		},
		CORSOrigins:    cfg.CORSOrigins,
		RequestTimeout: cfg.RequestTimeout,
	})

	srv := &http.Server{Addr: ":" + cfg.Port, Handler: engine, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		log.Printf("listening on :%s (db=%s)", cfg.Port, cfg.MongoDB)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("http: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
