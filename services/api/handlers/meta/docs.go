package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"
	ctx "plutomi/shared/context"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func DocsRoot(w http.ResponseWriter, r *http.Request, ctx *ctx.AppContext) {
	ctx.Logger.Debug("API Root", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	ctx.Logger.Info("Sending message to Kafka")

	res := apiTypes.BasePlutomiResponse{
		Message: "Hello from the Plutomi API! Did you mean to go to the docs?",
		DocsUrl: "https://plutomi.com/docs/api",
	}

	render.JSON(w, r, res)
}
