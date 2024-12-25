package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	clients "plutomi/shared/clients"
	ctx "plutomi/shared/context"

	"go.uber.org/zap"

	csm "plutomi/shared/consumers"
	utils "plutomi/shared/utils"
)

const service = "consumer"

func main() {
	// Initialize the environment variables
	env := utils.LoadEnv("../../../.env")

	// Initialize the logger
	logger := utils.GetLogger(service, env)
	defer logger.Sync()

	// Initialize MySQL
	mysql := clients.GetMySQL(logger, service, env)
	defer mysql.Close()

	// Initialize the AppContext
	appCtx := &ctx.AppContext{
		Env:         env,
		Logger:      logger,
		ServiceName: service,
		MySQL:       mysql,
	}

	// Channel to listen for OS signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Create a context for the worker
	workerCtx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start the worker in a goroutine
	go func() {
		err := csm.StartConsumer(workerCtx, appCtx, doWork, 1*time.Second)
		if err != nil {
			appCtx.Logger.Fatal("Worker encountered an error", zap.String("error", err.Error()))
		}
	}()

	// Block until a signal is received
	<-stop

	// Gracefully stop the worker
	appCtx.Logger.Info("Shutting down worker...") // TODO name
	cancel()

	// Allow some time for cleanup
	time.Sleep(2 * time.Second)
	appCtx.Logger.Info("Worker stopped gracefully")
}

func doWork(appCtx *ctx.AppContext) (bool, error) {
	// Perform the work
	return true, nil
}
