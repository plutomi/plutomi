package routes

import (
	"net/http"
	meta "plutomi/api/handlers/meta"
	"plutomi/api/handlers/users"
	"plutomi/shared/types"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"
)

func SetupRoutes(ctx *types.AppContext) *chi.Mux {
	router := chi.NewRouter()

	// Middleware setup
	router.Use(
		middleware.AllowContentType("application/json"),
		middleware.CleanPath,
		middleware.RequestID,
		middleware.RealIP,
		middleware.Recoverer,
		middleware.Timeout(30*time.Second),
		render.SetContentType(render.ContentTypeJSON),
	)

	// Internal k8s health check
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		meta.HealthCheck(w, r, ctx)
	})

	// Public health check
	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		meta.HealthCheck(w, r, ctx)
	})

	// Show docs
	router.Get("/api", func(w http.ResponseWriter, r *http.Request) {
		meta.DocsRoot(w, r, ctx)
	})
	router.Get("/api/", func(w http.ResponseWriter, r *http.Request) {
		meta.DocsRoot(w, r, ctx)
	})
	router.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		meta.DocsRoot(w, r, ctx)
	})
	router.Get("/docs/", func(w http.ResponseWriter, r *http.Request) {
		meta.DocsRoot(w, r, ctx)
	})

	router.Post("/api/users", func(w http.ResponseWriter, r *http.Request) {
		users.CreateUsers(w, r, ctx)
	})

	// Catch all
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		meta.NotFound(w, r, ctx)
	})

	router.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		meta.MethodNotAllowed(w, r, ctx)
	})

	return router
}
