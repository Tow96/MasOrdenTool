package server

import (
	"log/slog"
	"net/http"

	"github.com/tow96/masordentool/src/pkg/env"
	"github.com/tow96/masordentool/src/pkg/routes"
)

func StartServer() {
	routes.SetRoutes()

	port := ":" + env.GetVariable("HTTP_PORT")
	http.ListenAndServe(port, nil)
	slog.Info("Server listening on port" + port)
}
