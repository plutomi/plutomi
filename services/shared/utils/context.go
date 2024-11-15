package utils

import (
	"plutomi/shared/types"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)


type Context struct {
	Env         types.EnvironmentVariables
	Logger      *zap.Logger
	Application string
	MySQL       *sqlx.DB
}


// Sets up a global context for the application.
// Gets the environment variables, logger, and MySQL connection.
// You *must* call defer Context.Logger.Sync() and defer Context.MySQL.Close() in your main function!
func InitContext(application string) *Context {

	// Load environment variables
	env := LoadEnv()

	logger := GetLogger(application)

	mysql := GetDB(logger, application, env)
	// TODO add kafka

	return &Context{
		Env:         env,
		Logger:      logger,
		Application: application,
		MySQL:       mysql,
	}
	
}
