package handlers

import (
	"net/http"
	"plutomi/shared"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func HandleNotFound(w http.ResponseWriter, r *http.Request, context *shared.AppContext) {
	context.Logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))
	res := shared.PlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
