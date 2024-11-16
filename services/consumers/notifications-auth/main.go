package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	clients "plutomi/shared/clients"
	"plutomi/shared/constants"
	"plutomi/shared/utils"

	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

func handler(record *kgo.Record, ctx *utils.Context) error {
	ctx.Logger.Info("Received message", zap.String("message", string(record.Value)))
	return nil
}

func main() {
	ctx := utils.InitAppContext("notifications-auth")
	defer ctx.Logger.Sync()
	defer ctx.MySQL.Close()
	

    brokers := []string{"localhost:9092"}




    consumer, err := clients.NewPlutomiConsumer(
        brokers,
        constants.ConsumerGroupNotifications,
        handler,
		constants.TopicAuth,
		constants.TopicAuthRetry,
		constants.TopicAuthDLQ,
       
    )
    if err != nil {
        fmt.Fprintf(os.Stderr, "Failed to create consumer: %v\n", err)
        os.Exit(1)
    }
	

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    // Handle graceful shutdown
    sigs := make(chan os.Signal, 1)
    signal.Notify(sigs, os.Interrupt)
    go func() {
        <-sigs
        fmt.Println("Shutting down consumer...")
        consumer.Close()
        cancel()
    }()

    // Run the consumer
    consumer.Run(ctx)
}
