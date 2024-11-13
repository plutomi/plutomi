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

	router.Use(middleware.AllowContentType("application/json"))
	router.Use(middleware.CleanPath)
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(30 * time.Second))
	router.Use(render.SetContentType(render.ContentTypeJSON))


	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleRoot(w, r, context)
	})

	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleNotFound(w, r, context)
	})

	return router
}

