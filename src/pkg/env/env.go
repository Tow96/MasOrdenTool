package env

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

func GetVariable(key string) string {
	err := godotenv.Load()
	if err != nil {
		slog.Error("Error loading .env")
		os.Exit(1)
	}
	return os.Getenv(key)
}
