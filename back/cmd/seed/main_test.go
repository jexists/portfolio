package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// 실제 mockup 폴더가 시드 형식(파일 = 컬렉션, JSON 배열, 모든 문서에 _id)을 지키는지 확인한다.
func TestLoadCollectionsFromMockup(t *testing.T) {
	dir := filepath.Join("..", "..", "..", "mockup")
	collections, err := loadCollections(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"profiles", "projects", "categories", "users", "visits"} {
		raw, err := os.ReadFile(filepath.Join(dir, name+".json"))
		if err != nil {
			t.Fatal(err)
		}
		var items []any
		if err := json.Unmarshal(raw, &items); err != nil {
			t.Fatal(err)
		}
		if got := len(collections[name]); got != len(items) || got == 0 {
			t.Errorf("%s: loaded %d docs, file has %d", name, got, len(items))
		}
	}
}

func TestLoadCollectionsRejectsMissingID(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "things.json"), []byte(`[{"name":"no id"}]`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := loadCollections(dir); err == nil {
		t.Fatal("want error for document without _id")
	}
}
