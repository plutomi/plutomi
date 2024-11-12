package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"plutomi/api/routes"
	"plutomi/shared/types"
	"plutomi/shared/utils"
	"time"

	"go.uber.org/zap"
)

const application = "api"

func main() {
	// Load environment variables
	env := utils.LoadEnv()
	

	// Get a logger
	logger := utils.GetLogger(application)
	defer logger.Sync()


	logger.Debug("JOSE DEBUG MYSQL URL", zap.String("MYSQL URL", env.MySQLUrl))
	// Get a MySQL connection
	mysql := utils.GetDB(logger, application, env)
	defer mysql.Close()

	// Set global app context
	appCtx := &types.AppContext{
		Env:         env,
		Logger:      logger,
		Application: application,
		MySQL:       mysql,
	}

	// Setup routes
	routes := routes.SetupRoutes(appCtx)

	// Convert the env struct to JSON for logging
	envJSON, err := json.Marshal(env)
	if err != nil {
		logger.Error("Failed to marshal env to JSON", zap.String("error", err.Error()))
		os.Exit(1)
	}

	logger.Info(fmt.Sprintf("%s listening on port %s", application, env.Port), zap.String("env", string(envJSON)))

	if err := http.ListenAndServe(":"+env.Port, routes); err != nil {
		time.Sleep(2 * time.Second)
		logger.Fatal("Server failed to start in %s", zap.String("error", err.Error()))
	}
}
