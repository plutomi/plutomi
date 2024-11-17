package types

import (
	"github.com/jmoiron/sqlx"
	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

type AppContext struct {
	Env         EnvironmentVariables
	Logger      *zap.Logger
	Application string
	MySQL       *sqlx.DB
	Kafka 	 *kgo.Client
}
