package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"
	sharedTypes "plutomi/shared/types"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func DocsRoot(w http.ResponseWriter, r *http.Request, ctx *sharedTypes.AppContext) {
	ctx.Logger.Warn("API Root", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := apiTypes.BasePlutomiResponse{
		Message: "Hello from the Plutomi API! Did you mean to go to the docs?",
		DocsUrl: "https://plutomi.com/docs/api",
	}

	render.JSON(w, r, res)
}
