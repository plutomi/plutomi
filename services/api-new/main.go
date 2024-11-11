package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type PlutomiResponse struct {
	Message string `json:"message"`
	DocsUrl string `json:"docs_url"`
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(middleware.Heartbeat("/"))
	
	// Routes
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		// res.JSON(w, http.StatusOK, PlutomiResponse{Message: "Hello from the Plutomi API! Did you mean to go to the docs?", DocsUrl: "https://plutomi.com/docs/api"});
	})

	// Print a message to the console
	fmt.Println("Server is running on port 3000")

	http.ListenAndServe(":3000", r)


	// Fallbacks
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
		w.Write([]byte("route does not exist"))
	})
	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(405)
		w.Write([]byte("method is not valid"))
	})
}
