package handlers

import (
	"net/http"
	"plutomi/shared"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func HandleRoot(w http.ResponseWriter, r *http.Request, context *shared.AppContext) {
	context.Logger.Warn("API Root", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := shared.PlutomiResponse{
		Message: "Hello from the Plutomi API! Did you mean to go to the docs?",
		DocsUrl: "https://plutomi.com/docs/api",
	}

	context.Logger.Info("Home route accessed")
	render.JSON(w, r, res)
}

