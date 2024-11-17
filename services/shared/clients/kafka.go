package clients

import (
	"fmt"
	"plutomi/shared/constants"

	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)


func GetKafka(brokers []string, group constants.ConsumerGroup, topic constants.KafkaTopic, logger *zap.Logger) *kgo.Client {
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
	
	return client
}
