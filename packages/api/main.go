package main

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"time"
)

func main() {

	http.HandleFunc("/api/ssr", func(w http.ResponseWriter, r *http.Request) {
		message := map[string]string{
			"message": fmt.Sprintf("SSR GO APP - %s", time.Now().Format(time.RFC3339)),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(message)
	})

	http.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
	})

	http.HandleFunc("/api/hi", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hi")
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
