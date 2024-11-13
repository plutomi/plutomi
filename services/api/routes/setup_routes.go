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

type Handler struct {
    ctx *context.Context
}

// TODO add middleware to log all incoming and outgoing requests

func WithContext(ctx *context.Context) *Handler {
    return &Handler{ctx: ctx}
}

func SetupRoutes(ctx *context.Context) *chi.Mux {
    router := chi.NewRouter()
    wc := WithContext(ctx)
    

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
	router.Get("/health", wc.HealthCheck)

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
