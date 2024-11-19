package utils

import (
	"log"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	adapter "github.com/axiomhq/axiom-go/adapters/zap"
	"github.com/axiomhq/axiom-go/axiom"

	types "plutomi/shared/types"
)

// GetLogger returns a new zap logger with an Axiom core and a console core
// Logs to both Axiom and the console
func GetLogger(application string, env types.EnvironmentVariables) *zap.Logger {

	// 1. Setup the Axiom core for zap
	var axiomCore zapcore.Core
	axiomCoreInitialized := false

	axiomCore, err := adapter.New(
		adapter.SetDataset(env.AxiomDataset),
		adapter.SetClientOptions(
			axiom.SetPersonalTokenConfig(env.AxiomToken, env.AxiomOrgId),
		),
	)
	if err != nil {
		log.Printf("Can't initialize Axiom core for zap: %v in %s. Falling back to console logger.", err, application)
	} else {
		axiomCoreInitialized = true
	}

	// 2. Setup a console core for local logging, using zapcore.Lock(os.Stdout)
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
	consoleCore := zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), zap.DebugLevel)

	var core zapcore.Core

	// 3. Combine Axiom and Console cores if Axiom core is initialized
	if axiomCoreInitialized {
		core = zapcore.NewTee(axiomCore, consoleCore)
	} else {
		core = consoleCore
	}

	// 4. Create the logger with the combined core
	logger := zap.New(core)

	// You have to defer the Sync method to guarantee that all the logs are flushed AS WELL AS wherever you call GetLogger()
	defer logger.Sync()

	logger.With(zap.String("application", application)).Info("Logger initialized")
	return logger
}
