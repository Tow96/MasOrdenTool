package server

import (
	"log/slog"
	"net/http"

	"github.com/gorilla/mux"
)

func StartServer() {
	// TODO: Move this to a "routes" pkg eventually
	r := mux.NewRouter()
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Mas Orden Tool"))
	})
	// -------------------------------------------------

	// TODO: Set env
	port := ":3000"
	http.ListenAndServe(port, r)
	slog.Info("Server listening on port" + port)
}
