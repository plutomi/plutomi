package handlers

import (
	"api/shared"
	"net/http"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func HandleRoot(w http.ResponseWriter, r *http.Request, logger *zap.Logger) {
	logger.Warn("API Root", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := shared.PlutomiResponse{
		Message: "Hello from the Plutomi API! Did you mean to go to the docs?",
		DocsUrl: "https://plutomi.com/docs/api",
	}

	logger.Info("Home route accessed")
	render.JSON(w, r, res)
}

