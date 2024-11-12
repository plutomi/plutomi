package utils

import (
	"plutomi/shared/types"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func LoadEnv(logger *zap.Logger) types.EnvironmentVariables {
	err := godotenv.Load()
	if err != nil {
		logger.Warn("Error loading .env file, using defaults")
	}

	 defaultEnv := "development"
	 defaultPort:= "3000"

	env := types.EnvironmentVariables{
		Environment: GetEnvWithDefault("ENVIRONMENT", &defaultEnv, logger),
		Port:        GetEnvWithDefault("PORT", &defaultPort, logger),
	}

	return env
}
