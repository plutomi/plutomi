package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"

	utils "plutomi/shared/utils"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func NotFound(w http.ResponseWriter, r *http.Request, ctx *utils.AppContext) {
	ctx.Logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := apiTypes.BasePlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
