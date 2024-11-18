package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"
	ctx "plutomi/shared/context"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func NotFound(w http.ResponseWriter, r *http.Request, ctx *ctx.AppContext) {
	ctx.Logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := apiTypes.BasePlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
