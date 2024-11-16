package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	clients "plutomi/shared/clients"
	"plutomi/shared/constants"

	"github.com/twmb/franz-go/pkg/kgo"
)
func main() {
    brokers := []string{"localhost:9092"}
    groupID := constants.ConsumerGroupNotifications
    topic := constants.TopicAuth

    handler := func(record *kgo.Record) error {
        // Your message processing logic
        fmt.Printf("Processing record: %s\n", string(record.Value))
        return nil // Return error if processing fails
    }

    consumer, err := clients.NewPlutomiConsumer(
        brokers,
        groupID,
        topic,
        handler,
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
