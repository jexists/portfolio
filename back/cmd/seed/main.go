// 초기 데이터 삽입: mockup/<컬렉션>.json(JSON 배열)을 같은 이름의 컬렉션에 _id 기준으로 upsert 한다.
//
//	go run ./cmd/seed               # ../mockup 을 upsert
//	go run ./cmd/seed -drop         # 컬렉션을 비우고 다시 넣기
//	go run ./cmd/seed -dir ./data   # 다른 폴더
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/jexists/portfolio/back/internal/config"
	"github.com/jexists/portfolio/back/internal/db"
)

func main() {
	dir := flag.String("dir", "../mockup", "컬렉션별 JSON 폴더")
	drop := flag.Bool("drop", false, "넣기 전에 컬렉션 비우기")
	flag.Parse()

	collections, err := loadCollections(*dir)
	if err != nil {
		log.Fatal(err)
	}

	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	client, err := db.Connect(ctx, cfg.MongoURI)
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = db.Disconnect(client) }()
	database := client.Database(cfg.MongoDB)

	for _, name := range sortedKeys(collections) {
		n, err := seedCollection(ctx, database.Collection(name), collections[name], *drop)
		if err != nil {
			log.Fatalf("%s: %v", name, err)
		}
		fmt.Printf("%-12s %d docs\n", name, n)
	}
	if err := db.EnsureIndexes(ctx, database); err != nil {
		log.Fatal(err)
	}
}

// loadCollections 는 dir 의 *.json 을 읽어 {컬렉션 이름: 문서들} 로 돌려준다. 모든 문서에 _id 가 있어야 한다.
func loadCollections(dir string) (map[string][]bson.D, error) {
	files, err := filepath.Glob(filepath.Join(dir, "*.json"))
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, fmt.Errorf("%s 에 JSON 파일이 없습니다", dir)
	}
	out := map[string][]bson.D{}
	for _, file := range files {
		raw, err := os.ReadFile(file)
		if err != nil {
			return nil, err
		}
		var items []json.RawMessage
		if err := json.Unmarshal(raw, &items); err != nil {
			return nil, fmt.Errorf("%s: JSON 배열이어야 합니다: %w", file, err)
		}
		docs := make([]bson.D, 0, len(items))
		for i, item := range items {
			var doc bson.D
			if err := bson.UnmarshalExtJSON(item, false, &doc); err != nil {
				return nil, fmt.Errorf("%s[%d]: %w", file, i, err)
			}
			if !hasID(doc) {
				return nil, fmt.Errorf("%s[%d]: _id 가 없습니다", file, i)
			}
			docs = append(docs, doc)
		}
		out[strings.TrimSuffix(filepath.Base(file), ".json")] = docs
	}
	return out, nil
}

func seedCollection(ctx context.Context, coll *mongo.Collection, docs []bson.D, drop bool) (int, error) {
	if drop {
		if _, err := coll.DeleteMany(ctx, bson.D{}); err != nil {
			return 0, err
		}
	}
	for _, doc := range docs {
		id := idOf(doc)
		if _, err := coll.ReplaceOne(ctx, bson.D{{Key: "_id", Value: id}}, doc, options.Replace().SetUpsert(true)); err != nil {
			return 0, err
		}
	}
	return len(docs), nil
}

func hasID(doc bson.D) bool { return idOf(doc) != nil }

func idOf(doc bson.D) any {
	for _, e := range doc {
		if e.Key == "_id" {
			return e.Value
		}
	}
	return nil
}

func sortedKeys(m map[string][]bson.D) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
