package main

import (
	"log/slog"

	"github.com/tow96/masordentool/src/pkg/db"
	"github.com/tow96/masordentool/src/pkg/models"
)

func migrationRes(err error) {
	var msg string
	if err != nil {
		msg = "Error migrating tables"
		slog.Error(msg, "error", err.Error())
	} else {
		msg = "Successfully migrated tables"
		slog.Info(msg)
	}
}

func main() {
	db.ConnectToDb()
	acc_err := db.DB.AutoMigrate(models.Account{}, models.Fetched{})
	migrationRes(acc_err)

	db.DisconnectDb()
}
