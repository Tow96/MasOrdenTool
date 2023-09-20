package main

import (
	"github.com/tow96/masordentool/src/pkg/db"
	"github.com/tow96/masordentool/src/pkg/logger"
	"github.com/tow96/masordentool/src/pkg/scheduler"
	"github.com/tow96/masordentool/src/pkg/server"
)

func main() {
	logger.SetLogger()
	scheduler.SetupScheduler()
	db.ConnectToDb()

	// Separate cron routine for the scheduler
	go func() {
		defer scheduler.CronScheduler.Stop()
		scheduler.CronScheduler.Start()
		select {}
	}()

	server.StartServer()
}
