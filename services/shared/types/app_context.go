package types

import "go.uber.org/zap"


type AppContext struct {
	Env    EnvironmentVariables
	Logger *zap.Logger
}
