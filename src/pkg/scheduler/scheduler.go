package scheduler

import (
	"log/slog"
	"os"

	"github.com/robfig/cron/v3"
)

var CronScheduler *cron.Cron

func SetupScheduler() {
	CronScheduler = cron.New()

	_, err := CronScheduler.AddFunc("* * * * *", func() {
		slog.Info("CRONOS")
	})
	if err != nil {
		slog.Error("Error scheduling cron job")
		os.Exit(1)
	}
}
