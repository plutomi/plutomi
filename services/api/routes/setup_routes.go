package routes

import (
	"net/http"
	"plutomi/api/handlers"
	"plutomi/shared/context"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
)

func SetupRoutes(ctx *context.Context) *chi.Mux {
	router := chi.NewRouter()

	// Middleware setup
	router.Use(
		middleware.AllowContentType("application/json"),
		middleware.CleanPath,
		middleware.RequestID,
		middleware.RealIP,
		middleware.Recoverer,
		middleware.RedirectSlashes,
		middleware.Timeout(30*time.Second),
		render.SetContentType(render.ContentTypeJSON),
	)

	// Internal k8s health check
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.HealthCheck(w, r, ctx)
	})

	// Public health check
	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.HealthCheck(w, r, ctx)
	})

	// Show docs
	router.Get("/api", func(w http.ResponseWriter, r *http.Request) {
		handlers.DocsRoot(w, r, ctx)
	})
	router.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		handlers.DocsRoot(w, r, ctx)
	})

	// Catch all
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.NotFound(w, r, ctx)
	})

	router.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		handlers.MethodNotAllowed(w, r, ctx)
	})

	return router
}
