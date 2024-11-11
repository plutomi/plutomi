package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

type PlutomiResponse struct {
	Message string `json:"message"`
	DocsUrl string `json:"docs_url"`
}

type EnvironmentVariables struct {
	Environment string
	Port        string
}

// loadEnv loads environment variables and logs any errors encountered, using the provided logger
func loadEnv(logger *zap.Logger) EnvironmentVariables {
	err := godotenv.Load()
	if err != nil {
		logger.Warn("Error loading .env file, using defaults")
	}

	env := EnvironmentVariables{
		Environment: getEnvWithDefault("ENVIRONMENT", "development", logger),
		Port:        getEnvWithDefault("PORT", "3000", logger),
	}

	return env
}

// getEnvWithDefault fetches an environment variable or returns a default value if not set, logging the action
func getEnvWithDefault(key, defaultValue string, logger *zap.Logger) string {
	value := os.Getenv(key)
	if value == "" {
		logger.Info("Environment variable not set, using default", zap.String("key", key), zap.String("default", defaultValue))
		return defaultValue
	}
	return value
}

func main() {
	// Initialize zap logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	// Load environment variables using logger
	env := loadEnv(logger)

	// Set up and start server
	r := setupRoutes(logger)

	logger.Info("Starting server", zap.String("environment", env.Environment), zap.String("port", env.Port))
	fmt.Printf("Server is running in %s mode on port %s\n", env.Environment, env.Port)
	http.ListenAndServe(":"+env.Port, r)
}

// setupRoutes initializes the router, passing the logger to route handlers
func setupRoutes(logger *zap.Logger) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(render.SetContentType(render.ContentTypeJSON))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		handleHome(w, r, logger)
	})

	

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handleNotFound(w, r, logger)
	})

	return r
}

// handleHome is a sample route handler that takes in a logger
func handleHome(w http.ResponseWriter, r *http.Request, logger *zap.Logger) {
	res := PlutomiResponse{
		Message: "Hello from the Plutomi API! Did you mean to go to the docs?",
		DocsUrl: "https://plutomi.com/docs/api",
	}

	logger.Info("Home route accessed")
	render.JSON(w, r, res)
}

func handleNotFound(w http.ResponseWriter, r *http.Request, logger *zap.Logger) {
	logger.Warn("Route not found", zap.String("method", r.Method), zap.String("path", r.URL.Path))
	res := PlutomiResponse{
		Message: "Route not found",
		DocsUrl: "https://plutomi.com/docs/api",
	}
	render.Status(r, http.StatusNotFound)
	render.JSON(w, r, res)
}
