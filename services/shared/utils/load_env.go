package utils

import (
	"log"

	stypes "plutomi/shared/types"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func LoadEnv(env_path string) stypes.EnvironmentVariables {
	// Use it's own logger so no catch 22 with the *real* logger
	logger, logErr := zap.NewDevelopment()
	if logErr != nil {
		log.Fatalf("Can't initialize zap logger: %v", logErr)
	}
	defer logger.Sync()

	err := godotenv.Load(env_path)
	if err != nil {
		logger.Warn("Error loading .env file, using defaults")
	}

	defaultEnv := "development"
	defaultPort := "8080"

	env := stypes.EnvironmentVariables{
		Environment:  GetEnvWithDefault("ENVIRONMENT", &defaultEnv, logger),
		Port:         GetEnvWithDefault("PORT", &defaultPort, logger),
		MySQLUrl:     GetEnvWithDefault("MYSQL_URL", nil, logger),
		BaseWebUrl:   GetEnvWithDefault("BASE_WEB_URL", nil, logger),
		AxiomDataset: GetEnvWithDefault("AXIOM_DATASET", nil, logger),
		AxiomToken:   GetEnvWithDefault("AXIOM_TOKEN", nil, logger),
		AxiomOrgId:   GetEnvWithDefault("AXIOM_ORG_ID", nil, logger),
	}

	return env
}
