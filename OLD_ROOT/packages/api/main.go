package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {

	http.HandleFunc("/ssr", func(w http.ResponseWriter, r *http.Request) {
		message := map[string]string{
			"message": fmt.Sprintf("SSR GO APP - %s", time.Now().Format(time.RFC3339)),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(message)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
