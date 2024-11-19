package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"plutomi/api/routes"
	ctx "plutomi/shared/context"
	"syscall"
	"time"

	clients "plutomi/shared/clients"

	"go.uber.org/zap"

	utils "plutomi/shared/utils"
)

const application = "api"

func main() {
	// Initialize the environment variables
	env := utils.LoadEnv("../../.env")

	// Initialize the logger
	logger := utils.GetLogger(application, env)
	defer logger.Sync()

	// Initialize MySQL
	mysql := clients.GetMySQL(logger, application, env)
	defer mysql.Close()

	// Initialize Kafka
	 kafka := clients.NewKafkaProducer([]string{env.KafkaUrl}, logger, application)
	// kafka := clients.NewKafka([]string{env.KafkaUrl}, constants.ConsumerGroupNotifications, constants.TopicAuth, logger)

	defer kafka.Close()

	// Initialize the AppContext
	ctx := &ctx.AppContext{
		Env:         env,
		Logger:      logger,
		Application: application,
		MySQL:       mysql,
		Kafka:       kafka,
	}

	// Setup routes
	routes := routes.SetupRoutes(ctx)

	// Create an HTTP server with a context
	server := &http.Server{
		Addr:    ":" + ctx.Env.Port,
		Handler: routes,
	}

	// Channel to listen for OS signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Run the server in a goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			ctx.Logger.Fatal("Server failed to start", zap.String("error", err.Error()))
		}
	}()

	// Block until a signal is received
	<-stop

	// Gracefully shut down the server
	ctx.Logger.Info("Shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		ctx.Logger.Fatal("Server forced to shutdown", zap.String("error", err.Error()))
	}

	ctx.Logger.Info("Server exited gracefully")
}
