package logger

import (
	"log/slog"
	"os"
)

func SetLogger() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
}
