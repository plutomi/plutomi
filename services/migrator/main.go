package main

import (
	"fmt"

	clients "plutomi/shared/clients"
	utils "plutomi/shared/utils"

	sharedTypes "plutomi/shared/types"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"go.uber.org/zap"
)

const application = "migrator"

func main() {
	// Initialize the environment variables
	env := utils.LoadEnv("../../.env")

	// Initialize the logger
	logger := utils.GetLogger(application, env)
	defer logger.Sync()

	// Initialize MySQL
	mysql := clients.GetMySQL(logger, application, env)
	defer mysql.Close()

	// Initialize the AppContext
	ctx := sharedTypes.AppContext{
		Env:         env,
		Logger:      logger,
		Application: application,
		MySQL:       mysql,
	}

	m, err := migrate.New(
		"file://migrations",
		fmt.Sprintf("mysql://%s", ctx.Env.MySQLUrl),
	)

	if err != nil {
		ctx.Logger.Fatal("Failed to create migration instance", zap.String("error", err.Error()))
	}

	defer m.Close()

	err = m.Up()

	if err != nil {

		if err.Error() != "no change" {
			ctx.Logger.Fatal("Failed to run migrations", zap.String("error", err.Error()))
		}
	}

	ctx.Logger.Info("Migrations ran successfully")
}
