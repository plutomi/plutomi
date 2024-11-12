package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"
	"plutomi/shared/types"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func HandleNotFound(w http.ResponseWriter, r *http.Request, context *types.AppContext) {
	context.Logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))
	res := apiTypes.PlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
