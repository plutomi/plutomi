package clients

import (
	"context"
	"fmt"
	"os"
	"plutomi/shared/constants"

	"github.com/twmb/franz-go/pkg/kgo"
)

type MessageHandler func(*kgo.Record) error

type PlutomiConsumer struct {
    client     *kgo.Client
    handler    MessageHandler
    retryTopic constants.KafkaTopic
    dlqTopic   constants.KafkaTopic
}

func NewPlutomiConsumer(
    brokers []string,
    groupID constants.ConsumerGroup,
    topic constants.KafkaTopic,
    handler MessageHandler,
    retryTopic constants.KafkaTopic,
    dlqTopic constants.KafkaTopic,
) (*PlutomiConsumer, error) {
    opts := []kgo.Opt{
        kgo.SeedBrokers(brokers...),
        kgo.ConsumerGroup(string(groupID)),
        kgo.ConsumeTopics(string(topic)),
        kgo.DisableAutoCommit(), // Disable auto-commit
    }

    client, err := kgo.NewClient(opts...)
    if err != nil {
        return nil, fmt.Errorf("unable to create client: %v", err)
    }

    return &PlutomiConsumer{
        client:     client,
        handler:    handler,
        retryTopic: retryTopic,
        dlqTopic:   dlqTopic,
    }, nil
}

func (pc *PlutomiConsumer) Close() {
    pc.client.Close()
}

func (pc *PlutomiConsumer) Run(ctx context.Context) {
    for {
        fetches := pc.client.PollFetches(ctx)
        if fetches.IsClientClosed() {
            return
        }

        fetches.EachError(func(t string, p int32, err error) {
            fmt.Fprintf(os.Stderr, "Error fetching from topic %s partition %d: %v\n", t, p, err)
        })

        fetches.EachRecord(func(record *kgo.Record) {
            err := pc.handler(record)
            if err != nil {
                // Handle error
                nextTopic := pc.getNextTopic(constants.KafkaTopic(record.Topic))
                if nextTopic != "" {
                    pc.publishToTopic(nextTopic, record)
                }
                // Commit offset to avoid reprocessing
                pc.client.CommitRecords(ctx, record)
                return
            }
            // On success, commit the offset
            pc.client.CommitRecords(ctx, record)
        })
    }
}

func (pc *PlutomiConsumer) getNextTopic(currentTopic constants.KafkaTopic) constants.KafkaTopic {
    switch currentTopic {
    case constants.TopicAuth:
        return pc.retryTopic
    case pc.retryTopic:
        return pc.dlqTopic
    default:
        return "" // No further retries
    }
}

func (pc *PlutomiConsumer) publishToTopic(topic constants.KafkaTopic, record *kgo.Record) {
    newRecord := &kgo.Record{
        Topic: string(topic),
        Key:   record.Key,
        Value: record.Value,
    }

    err := pc.client.ProduceSync(context.Background(), newRecord).FirstErr()
    if err != nil {
        fmt.Fprintf(os.Stderr, "Failed to publish to topic %s: %v\n", topic, err)
    }
}


