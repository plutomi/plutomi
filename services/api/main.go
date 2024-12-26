package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"plutomi/api/routes"
	appCtx "plutomi/shared/context"
	"syscall"
	"time"

	clients "plutomi/shared/clients"

	"go.uber.org/zap"

	utils "plutomi/shared/utils"
)

const name = "api"

func main() {
	// Initialize the environment variables
	env := utils.LoadEnv("../../.env")

	// Initialize the logger
	logger := utils.GetLogger(name, env)
	defer logger.Sync()

	// Initialize MySQL
	mysql := clients.GetMySQL(logger, name, env)
	defer mysql.Close()

	// Initialize the AppContext
	appCtx := &appCtx.AppContext{
		Env:         env,
		Logger:      logger,
		ServiceName: name,
		MySQL:       mysql,
	}

	// Setup routes
	routes := routes.SetupRoutes(appCtx)

	// Create an HTTP server with a context
	server := &http.Server{
		Addr:    ":" + appCtx.Env.Port,
		Handler: routes,
	}

	// Channel to listen for OS signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Run the server in a goroutine
	go func() {
		appCtx.Logger.Info("Starting server...", zap.String("port", appCtx.Env.Port))
		err := server.ListenAndServe()
		if err != nil {
			if err == http.ErrServerClosed {
				appCtx.Logger.Info("Server exited gracefully")
				return
			}
			appCtx.Logger.Fatal("Server failed to start", zap.String("error", err.Error()))
		}
	}()

	// Block until a signal is received
	<-stop

	appCtx.Logger.Info("Shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := server.Shutdown(shutdownCtx)

	if err != nil {
		appCtx.Logger.Fatal("Server forced to shutdown", zap.String("error", err.Error()))
	}

	appCtx.Logger.Info("Server exited gracefully.")
}
