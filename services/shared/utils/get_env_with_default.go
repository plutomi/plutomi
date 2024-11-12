package utils

import (
	"os"

	"go.uber.org/zap"
)

func GetEnvWithDefault(key string, optionalDefaultValue *string, logger *zap.Logger) string {
	value := os.Getenv(key)
	if value == "" && optionalDefaultValue != nil {
		logger.Info("Environment variable not set, using default", zap.String("key", key), zap.String("default", *optionalDefaultValue))
		return *optionalDefaultValue
	}
	return value
}
