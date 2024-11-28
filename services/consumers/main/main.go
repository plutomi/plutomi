package main

import (
	"context"
	"database/sql"
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
		if err := csm.StartConsumer(workerCtx, appCtx, pollMySQL); err != nil {
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

func pollMySQL(appCtx *ctx.AppContext) (bool, error) {
	// Start a transaction
	tx, err := appCtx.MySQL.Beginx()
	if err != nil {
		return true, err
	}

	// Ensure rollback if the function exits early
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	// Query for one task with a status of 'pending' (lock the row for update)
	row := tx.QueryRowx("SELECT id, task_data FROM tasks WHERE status = 'pending' LIMIT 1 FOR UPDATE")

	var id int
	var taskData string

	// Scan the row
	if err := row.Scan(&id, &taskData); err != nil {
		if err == sql.ErrNoRows {
			// No work available, exit early
			return false, nil
		}
		// Other error during scanning
		return true, err
	}

	// Process the task
	appCtx.Logger.Info("Processing task", zap.Int("id", id), zap.String("task_data", taskData))

	// ! TODO logic here
	
	// Update task status in the database
	result, err := tx.Exec("UPDATE tasks SET status = 'completed' WHERE id = ?", id)
	if err != nil {
		tx.Rollback()
		return true, err
	}

	// Check rows affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		tx.Rollback()
		return true, err
	}
	if rowsAffected == 0 {
		appCtx.Logger.Warn("No rows were updated, possible race condition", zap.Int("id", id))
	}

	// Commit the transaction explicitly (deferred above)
	return true, nil
}
