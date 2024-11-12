package utils

import (
	"fmt"
	"log"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	adapter "github.com/axiomhq/axiom-go/adapters/zap"
	"github.com/axiomhq/axiom-go/axiom"
)

// GetLogger returns a new zap logger with an Axiom core and a console core
// Logs to both Axiom and the console
// You *MUST* defer logger.Sync() wherever you call GetLogger() otherwise logs may not be flushed
func GetLogger(application string) *zap.Logger {
	// Load environment variables
	env := LoadEnv()

	// 1. Setup the Axiom core for zap
	axiomCore, err := adapter.New(
		adapter.SetDataset(env.AxiomDataset),
		adapter.SetClientOptions(
			axiom.SetPersonalTokenConfig(env.AxiomToken, env.AxiomOrgId),
		),
	)
	if err != nil {
		log.Fatalf("Can't initialize Axiom core for zap: %v in %s", err, application)
	}

	// 2. Setup a console core for local logging, using zapcore.Lock(os.Stdout)
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
	consoleCore := zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), zap.DebugLevel)

	// 3. Combine Axiom and Console cores
	core := zapcore.NewTee(axiomCore, consoleCore)

	// 4. Create the logger with the combined core
	logger := zap.New(core)

	// You have to defer the Sync method to guarantee that all the logs are flushed AS WELL AS wherever you call GetLogger()
	defer logger.Sync()
	
	logger.Info(fmt.Sprintf("Logger initialized in %s", application))

	return logger
}
