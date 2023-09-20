package db

import (
	"log/slog"
	"os"

	"github.com/tow96/masordentool/src/pkg/env"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var dsn = env.GetVariable("MYSQL_CONN_STRING")
var DB *gorm.DB

func ConnectToDb() {
	var error error
	DB, error = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if error != nil {
		slog.Error("Failed to connect to DB", "error", error)
		os.Exit(1)
	} else {
		slog.Info("Connected to DB")
	}
}

func DisconnectDb() {
	dv, _ := DB.DB()
	dv.Close()
}
