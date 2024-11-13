package handlers

import (
	"net/http"
	apiTypes "plutomi/api/types"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)



func HealthCheck(w http.ResponseWriter, r *http.Request) {
	Context.Logger.Debug("API HealthCheck", zap.String("method", r.Method), zap.String("path", r.URL.Path))

	res := apiTypes.PlutomiHealthCheckResponse{
        BasePlutomiResponse: apiTypes.BasePlutomiResponse{Message: "Saul Goodman", DocsUrl: "https://plutomi.com/docs/api"},
        MySQL: Context.MySQL.Ping() == nil,
    }

	render.JSON(w, r, res)
}
