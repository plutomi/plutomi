package routes

import (
	"net/http"
	"plutomi/api/handlers"
	"plutomi/shared/types"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
)

// TODO add middleware to log all incoming and outgoing requests

func SetupRoutes(context *types.AppContext) *chi.Mux {
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
		handlers.HealthCheck(w, r, context)
	})

	// Public health check
	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.HealthCheck(w, r, context)
	})

	// Show docs
	router.Get("/api", func(w http.ResponseWriter, r *http.Request) {
		handlers.DocsRoot(w, r, context)
	})
	router.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		handlers.DocsRoot(w, r, context)
	})





	// Catch all
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.NotFound(w, r, context)
	})

	router.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		handlers.MethodNotAllowed(w, r, context)
	})

	return router
}
