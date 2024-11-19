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
		msg := fmt.Errorf("unable to create client in '%s' topic for consumer group %s: %s", topic, group, err)
		logger.Fatal(msg.Error())
	}

	logger.Info(fmt.Sprintf("Created Kafka client for '%s' topic in '%s' consumer group", topic, group))

	return &PlutomiKafka{Client: client}
}

// NewKafkaProducer initializes a Kafka producer-only client.
func NewKafkaProducer(brokers []string, logger *zap.Logger, application string) *PlutomiKafka {
	opts := []kgo.Opt{
		kgo.SeedBrokers(brokers...),
	}

	client, err := kgo.NewClient(opts...)
	if err != nil {
		msg := fmt.Errorf("unable to create Kafka producer: %s", err)
		logger.Fatal(msg.Error())
	}

	msg := fmt.Sprintf("Created Kafka producer client in %s", application)
	logger.Info(msg)
	return &PlutomiKafka{Client: client}
}

// NewKafkaConsumer initializes a Kafka consumer-producer client.
func NewKafkaConsumer(brokers []string, group constants.ConsumerGroup, topic constants.KafkaTopic, logger *zap.Logger) *PlutomiKafka {
	opts := []kgo.Opt{
		kgo.SeedBrokers(brokers...),
		kgo.ConsumerGroup(string(group)),
		kgo.ConsumeTopics(string(topic)),
		kgo.DisableAutoCommit(),
		kgo.ConsumeResetOffset(kgo.NewOffset().AtStart()),
	}

	client, err := kgo.NewClient(opts...)
	if err != nil {
		msg := fmt.Errorf("unable to create Kafka consumer for group '%s': %s", group, err)
		logger.Fatal(msg.Error())
	}

	logger.Info(fmt.Sprintf("Created Kafka consumer for group '%s'", group))
	return &PlutomiKafka{Client: client}
}

func (k *PlutomiKafka) Close() {
	k.Client.Close()
}

var NextTopicMap = map[constants.KafkaTopic]constants.KafkaTopic{
	// Useful for debugging
	constants.TopicTest:      constants.TopicTestRetry,
	constants.TopicTestRetry: constants.TopicTestDLQ,
	constants.TopicTestDLQ:   "",

	constants.TopicAuth:      constants.TopicAuthRetry,
	constants.TopicAuthRetry: constants.TopicAuthDLQ,
	constants.TopicAuthDLQ:   "",
}

func (k *PlutomiKafka) GetNextTopic(currentTopic constants.KafkaTopic) constants.KafkaTopic {
	if nextTopic, ok := NextTopicMap[currentTopic]; ok {
		return nextTopic
	}
	return ""
}

// PublishToTopic publishes a message to a Kafka topic.
// If `key` and `value` are provided, it marshals the value and creates a new record.
func (k *PlutomiKafka) PublishToTopic(topic constants.KafkaTopic, key string, value interface{}) error {
	var newRecord *kgo.Record

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

	// Publish the record
	if err := k.Client.ProduceSync(context.Background(), newRecord).FirstErr(); err != nil {
		return fmt.Errorf("failed to publish message to topic %s: %w", topic, err)
	}

	return nil
}
