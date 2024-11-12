package shared

import (
	"os"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func LoadEnv(logger *zap.Logger) EnvironmentVariables {
	err := godotenv.Load()
	if err != nil {
		logger.Warn("Error loading .env file, using defaults")
	}

	 defaultEnv := "development"
	 defaultPort:= "3000"

	env := EnvironmentVariables{
		Environment: GetEnvWithDefault("ENVIRONMENT", &defaultEnv, logger),
		Port:        GetEnvWithDefault("PORT", &defaultPort, logger),
	}

	return env
}

func GetEnvWithDefault(key string, optionalDefaultValue *string, logger *zap.Logger) string {
	value := os.Getenv(key)
	if value == "" && optionalDefaultValue != nil {
		logger.Info("Environment variable not set, using default", zap.String("key", key), zap.String("default", *optionalDefaultValue))
		return *optionalDefaultValue
	}
	return value
}
