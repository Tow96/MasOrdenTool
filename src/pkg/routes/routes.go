package routes

import (
	"log/slog"
	"net/http"
	"text/template"

	"github.com/tow96/masordentool/src/pkg/db"
	"github.com/tow96/masordentool/src/pkg/models"
	"github.com/tow96/masordentool/src/pkg/processor"
)

func SetRoutes() {
	http.HandleFunc("/", getHomePage)
	http.HandleFunc("/account", addAccount)
	http.HandleFunc("/run", runCall)
}

func getHomePage(w http.ResponseWriter, r *http.Request) {
	var accounts []models.Account
	db.DB.Find(&accounts)
	tmpl := template.Must(template.ParseFiles("src/templates/index.html"))
	tmpl.Execute(w, accounts)
}

func addAccount(w http.ResponseWriter, r *http.Request) {
	var account models.Account
	account.User = r.PostFormValue("user")
	account.Name = r.PostFormValue("name")
	account.Password = r.PostFormValue("pass")
	account.Mail = "ToBeAdded"
	account.ClientID = "ToBeAdded"

	result := db.DB.Create(&account)

	if result.Error != nil {
		error := result.Error.Error()
		slog.Info(error)

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(error))
	}
	slog.Info("Created Account", "id", account.ID, "username", account.User)

	tmpl := template.Must(template.ParseFiles("src/templates/index.html"))
	tmpl.ExecuteTemplate(w, "account-list-element", &account)
}

func runCall(w http.ResponseWriter, r *http.Request) {
	processor.FetchData()
}
