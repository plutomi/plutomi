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
	ctx := &ctx.AppContext{
		Env:         env,
		Logger:      logger,
		ServiceName: name,
		MySQL:       mysql,
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

	// Start the worker
	go pollAndProcessEvents(ctx)

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

func pollAndProcessEvents(appCtx *ctx.AppContext) {
	for {
		events := fetchEvents(appCtx)
		for _, event := range events {
			handleEvent(appCtx, event)
		}
		time.Sleep(1 * time.Second) // Poll interval
	}
}

func fetchEvents(appCtx *ctx.AppContext) []PlutomiEvent {
	var events []Event
	rows, err := appCtx.MySQL.Query("SELECT id, type, data FROM events WHERE processed = false LIMIT 10")
	if err != nil {
		appCtx.Logger.Error("Error fetching events", zap.Error(err))
		return events
	}
	defer rows.Close()

	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.Type, &event.Data)
		if err != nil {
			appCtx.Logger.Error("Error scanning event", zap.Error(err))
			continue
		}
		events = append(events, event)
	}
	return events
}

func handleEvent(appCtx *ctx.AppContext, event Event) {
	switch event.Type {
	case "order.created":
		go sendEmail(appCtx, event)
		go chargeCard(appCtx, event)
	case "order.refunded":
		go sendRefundEmail(appCtx, event)
		go refundInStripe(appCtx, event)
	default:
		appCtx.Logger.Warn("Unknown event type", zap.String("type", event.Type))
	}

	// Mark event as processed
	_, err := appCtx.MySQL.Exec("UPDATE events SET processed = true WHERE id = ?", event.ID)
	if err != nil {
		appCtx.Logger.Error("Failed to mark event as processed", zap.String("eventID", event.ID), zap.Error(err))
	}
}
