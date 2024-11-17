package types

import (
	"plutomi/shared/clients"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type AppContext struct {
	Env         EnvironmentVariables
	Logger      *zap.Logger
	Application string
	MySQL       *sqlx.DB
	Kafka 	 	*clients.PlutomiKafka
}
