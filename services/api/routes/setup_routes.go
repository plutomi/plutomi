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


func SetupRoutes(context *types.AppContext) *chi.Mux {
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

