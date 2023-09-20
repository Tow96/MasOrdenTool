package server

import (
	"log/slog"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tow96/masordentool/src/pkg/env"
)

func StartServer() {
	// TODO: Move this to a "routes" pkg eventually
	r := mux.NewRouter()
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Mas Orden Tool"))
	})
	// -------------------------------------------------

	port := ":" + env.GetVariable("HTTP_PORT")
	http.ListenAndServe(port, r)
	slog.Info("Server listening on port" + port)
}
