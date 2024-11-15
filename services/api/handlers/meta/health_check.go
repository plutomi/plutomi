package handlers

import (
	"net/http"
	"plutomi/api/types"
	ctx "plutomi/shared/utils"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type PlutomiHealthCheckResponse struct {
    types.BasePlutomiResponse
    MySQL bool `json:"mysql"`
	Kafka bool `json:"kafka"`
	Redis bool `json:"redis"`
}

func HealthCheck(w http.ResponseWriter, r *http.Request, Context *ctx.Context) {
	Context.Logger.Debug("API HealthCheck", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := PlutomiHealthCheckResponse{
		BasePlutomiResponse: types.BasePlutomiResponse{Message: "Saul Goodman", DocsUrl: "https://plutomi.com/docs/api"},
		MySQL:               Context.MySQL.Ping() == nil,
		// TODO kafka
		// TODO redis
	}

	render.JSON(w, r, res)
}
