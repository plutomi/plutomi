package main

import (
	"fmt"

	utils "plutomi/shared/utils"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"go.uber.org/zap"
)

func main() {
	ctx := utils.InitContext("migrator")
	defer ctx.Logger.Sync()
	defer ctx.MySQL.Close()

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
