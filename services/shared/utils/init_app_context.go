package utils

import (
	"plutomi/shared/types"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)


type AppContext struct {
	Env         types.EnvironmentVariables
	Logger      *zap.Logger
	Application string
	MySQL       *sqlx.DB
}


// Sets up a global context for the application.
// Gets the environment variables, logger, and MySQL connection.
// You *must* call defer Context.Logger.Sync() and defer Context.MySQL.Close() in your main function!
func InitAppContext(application_name string, logger *zap.Logger, env_variables types.EnvironmentVariables, mysql *sqlx.DB) *AppContext {

	return &AppContext{
		Env:         env_variables,
		Logger:      logger,
		Application: application_name,
		MySQL:       mysql,
	}
	
}
