package routes

import (
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/render"

	meta "plutomi/api/handlers/meta"
	users "plutomi/api/handlers/users"
	ctx "plutomi/shared/context"
)

func SetupRoutes(appCtx *ctx.AppContext) *chi.Mux {
	r := chi.NewRouter()

	// Setup common middlewares
	r.Use(
		middleware.AllowContentType("application/json"),
		middleware.CleanPath,
		middleware.RequestID,
		middleware.RealIP,
		middleware.Recoverer,
		middleware.Timeout(30*time.Second),
		render.SetContentType(render.ContentTypeJSON),
	)

	// Top-level health check (k8s internal)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		meta.HealthCheck(w, r, appCtx)
	})
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		meta.HealthCheck(w, r, appCtx)
	})

	// API routes
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			meta.HealthCheck(w, r, appCtx)
		})

		// API docs route
		api.Get("/", func(w http.ResponseWriter, r *http.Request) {
			meta.DocsRoot(w, r, appCtx)
		})
		api.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
			meta.DocsRoot(w, r, appCtx)
		})

		// Users route
		api.Post("/users", func(w http.ResponseWriter, r *http.Request) {
			users.CreateUsers(w, r, appCtx)
		})
	})

	// Docs routes
	r.Route("/docs", func(docs chi.Router) {
		docs.Get("/", func(w http.ResponseWriter, r *http.Request) {
			meta.DocsRoot(w, r, appCtx)
		})
	})

	// Catch all
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		meta.NotFound(w, r, appCtx)
	})
	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		meta.MethodNotAllowed(w, r, appCtx)
	})

	return r
}
