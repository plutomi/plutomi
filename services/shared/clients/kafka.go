package clients

import (
	"context"
	"fmt"
	"plutomi/shared/constants"

	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

// Light Kafka Wrapper. If you need the underlying client, use .Kafka.Client
type PlutomiKafka struct {
	Client *kgo.Client
}

// NewKafka initializes the Kafka struct with a `kgo.Client`.
func NewKafka(brokers []string, group constants.ConsumerGroup, topic constants.KafkaTopic, logger *zap.Logger) *PlutomiKafka {
	opts := []kgo.Opt{
		kgo.SeedBrokers(brokers...),
		kgo.ConsumerGroup(string(group)),
		kgo.ConsumeTopics(string(topic)),
		// Disable auto-commit to allow for manual offset management
		kgo.DisableAutoCommit(),
		kgo.ConsumeResetOffset(kgo.NewOffset().AtStart()),
		//kgo.WithLogger(kgo.BasicLogger(os.Stdout, kgo.LogLevelDebug,  func() string { return "[KafkaClient] " })),
	}

	client, err := kgo.NewClient(opts...)

	if err != nil {
		msg := fmt.Errorf("unable to create client in %s topic for consumer group %s: %s", topic, group, err)
		logger.Fatal(msg.Error())
	}

	return &PlutomiKafka{Client: client}
}


func (k *PlutomiKafka) Close() {
	k.Client.Close()
}


func (k *PlutomiKafka) GetNextTopic(currentTopic constants.KafkaTopic) constants.KafkaTopic {

	// Auth topics
	if currentTopic == constants.TopicAuth {
		return constants.TopicAuthRetry
	}

	if currentTopic == constants.TopicAuthRetry {
		return constants.TopicAuthDLQ
	}



	// Test topics
	if currentTopic == constants.TopicTest {
		return constants.TopicTestRetry
	}

	if currentTopic == constants.TopicTestRetry {
		return constants.TopicTestDLQ
	}



	return ""
}


func (k *PlutomiKafka) PublishToTopic(topic constants.KafkaTopic, record *kgo.Record) error {
	newRecord := &kgo.Record{
		Topic: string(topic),
		Key:   record.Key,
		Value: record.Value,
	}

	err := k.Client.ProduceSync(context.Background(), newRecord).FirstErr()

	return err
}
