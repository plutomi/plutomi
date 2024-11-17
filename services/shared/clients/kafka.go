package clients

import (
	"context"
	"encoding/json"
	"errors"
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

var NextTopicMap = map[constants.KafkaTopic]constants.KafkaTopic{
    constants.TopicAuth:      constants.TopicAuthRetry,
    constants.TopicAuthRetry: constants.TopicAuthDLQ,
    constants.TopicAuthDLQ:   "",
    constants.TopicTest:      constants.TopicTestRetry,
    constants.TopicTestRetry: constants.TopicTestDLQ,
    constants.TopicTestDLQ:   "",
}

func (k *PlutomiKafka) GetNextTopic(currentTopic constants.KafkaTopic) constants.KafkaTopic {
	if nextTopic, ok := NextTopicMap[currentTopic]; ok {
		return nextTopic
	}
	return ""
}



// PublishToTopic publishes a message to a Kafka topic.
// If `record` is provided, it uses that directly - mostly used in Consumers.
// If `key` and `value` are provided, it marshals the value and creates a new record.
func (k *PlutomiKafka) PublishToTopic(topic constants.KafkaTopic, record *kgo.Record, key string, value interface{}) error {
	var newRecord *kgo.Record

	// If a record is already provided, reuse it
	if record != nil {
		newRecord = &kgo.Record{
			Topic: string(topic),
			Key:   record.Key,
			Value: record.Value,
		}
	} else {
		// If key and value are provided, create a new record
		if key == "" || value == nil {
			return errors.New("either record or key and value must be provided")
		}

		// Marshal the value to JSON
		data, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("failed to marshal value: %w", err)
		}

		newRecord = &kgo.Record{
			Topic: string(topic),
			Key:   []byte(key),
			Value: data,
		}
	}

	// Publish the record
	if err := k.Client.ProduceSync(context.Background(), newRecord).FirstErr(); err != nil {
		return fmt.Errorf("failed to publish message to topic %s: %w", topic, err)
	}

	return nil
}
