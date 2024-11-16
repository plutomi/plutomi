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



func SampleHandler(self *clients.PlutomiConsumer, record *kgo.Record) error {
    // Example usage of consumer within the handler
    self.Logger.Info("Received message", zap.String("key", string(record.Key)), zap.String("value", string(record.Value)))

    // Add your business logic here
    return nil
}
const application = "notifications-auth-consumer"


func main() {
	// Initialize the environment variables
	env := utils.LoadEnv("../../../.env")

	// Initialize the logger
	logger := utils.GetLogger(application, env)
	defer logger.Sync()


	// Initialize MySQL 
	mysql := clients.GetMySQL(logger, application, env)
	defer mysql.Close()


	// Initialize the AppContext
	ctx := utils.InitAppContext(application, logger, env, mysql)

    brokers := []string{"localhost:9092"}


    consumer, err := clients.NewPlutomiConsumer(
        brokers,
        constants.ConsumerGroupNotifications,
        SampleHandler,
		constants.TopicAuth,
		constants.TopicAuthRetry,
		constants.TopicAuthDLQ,
       ctx,
    )
    if err != nil {
        fmt.Fprintf(os.Stderr, "Failed to create consumer: %v\n", err)
        os.Exit(1)
    }
	

    go_context, cancel := context.WithCancel(context.Background())
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
    consumer.Run(go_context)
}
