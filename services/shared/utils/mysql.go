package utils

import (
	"fmt"
	"plutomi/shared/types"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func GetDB(logger *zap.Logger, application string, env types.EnvironmentVariables) *sqlx.DB {
	db, err := sqlx.Connect("mysql", env.MySQLUrl)
	if err != nil {
		msg := fmt.Sprintf("Failed to connect to database in %s", application)
		logger.Fatal(msg, zap.String("error", err.Error()))
	}

	logger.Info(fmt.Sprintf("Connected to MySQL in %s", application))

	// Configure the connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)


	return db

}
