package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"plutomi/api/routes"
	clients "plutomi/shared/clients"
	"time"

	utils "plutomi/shared/utils"

	"go.uber.org/zap"
)

const application = "api"

func main() {
	// Initialize the environment variables
	env := utils.LoadEnv()

	// Initialize the logger
	logger := utils.GetLogger(application)
	defer logger.Sync()


	// Initialize MySQL 
	mysql := clients.GetMySQL(logger, application, env)
	defer mysql.Close()


	// Initialize the context
	ctx := utils.InitAppContext(application, logger, env, mysql)


	// Setup routes
	routes := routes.SetupRoutes(ctx)

	// Convert the env struct to JSON for logging
	envJSON, err := json.Marshal(ctx.Env)
	if err != nil {
		ctx.Logger.Fatal("Failed to marshal env to JSON", zap.String("error", err.Error()))
	}

	ctx.Logger.Info(fmt.Sprintf("%s listening on port %s", application, ctx.Env.Port), zap.String("env", string(envJSON)))

	if err := http.ListenAndServe(":"+ctx.Env.Port, routes); err != nil {
		time.Sleep(2 * time.Second)
		ctx.Logger.Fatal("Server failed to start in %s", zap.String("error", err.Error()))
	}
}
