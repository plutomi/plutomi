package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"
	utils "plutomi/shared/utils"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func MethodNotAllowed(w http.ResponseWriter, r *http.Request, ctx *utils.AppContext) {
	ctx.Logger.Warn("Method not allowed", zap.String("method", r.Method), zap.String("path", r.URL.Path))
	res := apiTypes.BasePlutomiResponse{
		Message: "Method not allowed",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusMethodNotAllowed)
	render.JSON(w, r, res)
}
