package types

import (
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	sc "plutomi/shared/clients"
)


type AppContext struct {
	Env        EnvironmentVariables
	Logger      *zap.Logger
	Application string
	MySQL       *sqlx.DB
	Kafka 	 	sc.PlutomiKafka
}
