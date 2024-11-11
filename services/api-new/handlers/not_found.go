package handlers

import (
	"api/shared"
	"net/http"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func HandleNotFound(w http.ResponseWriter, r *http.Request, logger *zap.Logger) {
	logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))
	res := shared.PlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
