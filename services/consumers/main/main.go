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

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	csm "plutomi/shared/consumers"
	entities "plutomi/shared/entities"
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
		err := csm.StartConsumer(workerCtx, appCtx, pollMySQL, 1 * time.Second)
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

// pollMySQL polls the MySQL database for pending tasks, processes one if available,
// and determines if there are more tasks to process or if it should poll again immediately.
// It returns a boolean indicating whether to poll immediately and an error if one occurred.
func pollMySQL(appCtx *ctx.AppContext) (retryASAP bool, err error) {
	// Start a new database transaction.
	var tx *sqlx.Tx
	tx, err = appCtx.MySQL.Beginx()
	if err != nil {
		appCtx.Logger.Error("Failed to start transaction", zap.String("error", err.Error()))
		// If starting the transaction fails, return the error.
		// Set retryASAP = true to retry immediately.
		return true, err
	}

	// Defer a function to handle transaction commit or rollback.
	defer func() {
		if err != nil {
			// If an error occurred, rollback the transaction.
			err = tx.Rollback()

			if err != nil {
				appCtx.Logger.Error("Failed to rollback transaction", zap.String("error", err.Error()))
			}

		} else {
			// If no error, commit the transaction.
			err = tx.Commit()
			if err != nil {
				appCtx.Logger.Error("Failed to commit transaction", zap.String("error", err.Error()))

			}
		}
	}()

	var tasks []entities.InternalTask

	// Query for up to two tasks with a status of 'pending' and lock the rows for update.
	// The reason for selecting two tasks is to process one and check if there are more tasks to process.
	err = tx.Select(&tasks, "SELECT id, type, data FROM internal_tasks WHERE status = 'pending' ORDER BY id ASC LIMIT 2 FOR UPDATE SKIP LOCKED")
	if err != nil {
		appCtx.Logger.Error("Failed to query for tasks", zap.String("error", err.Error()))
		// Return any error encountered during the query.
		// Set retryASAP = true to retry immediately.
		return true, err
	}

	if err == sql.ErrNoRows || len(tasks) == 0 {
		appCtx.Logger.Info("No pending tasks found")
		// No pending tasks found, return without processing.
		// The deferred function will commit the transaction.
		// Set retryASAP = false to indicate no immediate work to do.
		return false, nil
	}

	// Process the first task in the list.
	task := tasks[0]

	// Log that we're processing the task.
	appCtx.Logger.Info("Processing task", zap.Int("id", task.ID), zap.String("data", task.Data))

	// TODO: Add task processing logic here.
	err = processTask(task, *appCtx)
	if err != nil {
		appCtx.Logger.Error("Failed to process task", zap.String("error", err.Error()))
	    // Return error if task processing fails.
	    // Set retryASAP = true to retry immediately.
	    return true, err
	}

	// After processing the task, update its status to 'completed' in the database.
	// TODO task_audit?
	var result sql.Result
	result, err = tx.Exec("UPDATE internal_tasks SET status = 'completed' WHERE id = ?", task.ID)
	if err != nil {
		appCtx.Logger.Error("Failed to update task status", zap.String("error", err.Error()))
		// Return the error if the update fails.
		// Set retryASAP = true to retry immediately.
		return true, err
	}

	// Check how many rows were affected by the update.
	var rowsAffected int64
	rowsAffected, err = result.RowsAffected()
	if err != nil {
		appCtx.Logger.Error("Failed to get rows affected", zap.String("error", err.Error()))
		// Return the error if unable to get rows affected.
		// Set retryASAP = true to retry immediately.
		return true, err
	}
	if rowsAffected == 0 {
		// Warn if no rows were updated, which could indicate a race condition.
		appCtx.Logger.Warn("No rows were updated, possible race condition", zap.Int("id", task.ID))
	}

	// If there are more tasks to process, return retryASAP = true to retry immediately and pick it up
	if len(tasks) > 1 {
		appCtx.Logger.Info("More tasks to process")
		return true, nil
	}


	// Return that there is no more *immediate* work to be done until the next interval
	return false, nil
}

func processTask(task entities.InternalTask, appCtx ctx.AppContext) error {

	if task.Type == "poop" {
		appCtx.Logger.Info("Processing task", zap.Int("id", task.ID), zap.String("data", task.Data))
		return nil
	}

	appCtx.Logger.Error("Unknown task type", zap.String("type", task.Type))


	return nil
}
