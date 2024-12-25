package clients

import (
	"context"
	ts "plutomi/shared/types"
	"time"

	"github.com/nats-io/nats.go"
	"go.uber.org/zap"
)

// https://natsbyexample.com/examples/jetstream/interest-stream/go

func GetNATS(logger *zap.Logger, application string, env ts.EnvironmentVariables) (nats.JetStreamContext, *nats.Conn) {

	// 1. Connect to NATS
	nc, err := nats.Connect(env.NatsUrl)
	if err != nil {
		logger.Fatal("Failed to connect to NATS",
			zap.String("error", err.Error()),
			zap.String("application", application),
		)
	}

	// 2. Create a JetStream context
	js, err := nc.JetStream()
	if err != nil {
		logger.Fatal("Failed to create JetStream context",
			zap.String("error", err.Error()),
			zap.String("application", application),
		)
	}

	// 3. Create or ensure the "events" stream exists
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = js.AddStream(&nats.StreamConfig{
		Name:      "events",
		Retention: nats.InterestPolicy,
		Subjects:  []string{"events.>"},
	}, nats.Context(ctx))
	if err != nil {
		if err == nats.ErrStreamNameAlreadyInUse {
			logger.Warn("Events stream already exists; skipping creation",
				zap.String("application", application),
			)
		} else {
			logger.Fatal("Failed to create events stream",
				zap.String("error", err.Error()),
				zap.String("application", application),
			)
		}
	}

	logger.Info("Connected to NATS and ensured 'events' stream exists",
		zap.String("application", application),
	)

	// 4. Return both the JetStream context and the *nats.Conn
	return js, nc

}
