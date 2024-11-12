package main

import (
	"fmt"
	"net/http"
	"plutomi/api/handlers"
	"plutomi/shared/types"
	"plutomi/shared/utils"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)



func main() {

	
	// Initialize zap logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Load environment variables 
	env := utils.LoadEnv(logger)

	appCtx := &types.AppContext{
		Env:    env,
		Logger: logger,
	}


	routes := setupRoutes(appCtx)

	logger.Info("Starting server", zap.String("environment", env.Environment), zap.String("port", env.Port), zap.String("TEST", env.Test))
	fmt.Printf("Server is running in %s mode on port %s\n", env.Environment, env.Port)
	http.ListenAndServe(":"+env.Port, routes)
}

// setupRoutes initializes the router, passing the logger to route handlers
func setupRoutes(context *types.AppContext) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(render.SetContentType(render.ContentTypeJSON))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleRoot(w, r, context)
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleNotFound(w, r, context)
	})

	return r
}
