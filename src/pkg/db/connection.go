package db

import (
	"log/slog"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// TODO: add env
var dsn = "admin:pass@tcp(127.0.0.1:3306)/masorden?charset=utf8&parseTime=True&loc=Local"
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
