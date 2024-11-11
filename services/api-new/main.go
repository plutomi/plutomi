package main

import (
	"api/handlers"
	"api/shared"
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

// loadEnv loads environment variables and logs any errors encountered, using the provided logger
func loadEnv(logger *zap.Logger) shared.EnvironmentVariables {
	err := godotenv.Load()
	if err != nil {
		logger.Warn("Error loading .env file, using defaults")
	}

	env := shared.EnvironmentVariables{
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
		handlers.HandleRoot(w, r, logger)
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleNotFound(w, r, logger)
	})

	return r
}
