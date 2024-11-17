package consumers

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	clients "plutomi/shared/clients"
	"plutomi/shared/constants"
	"plutomi/shared/types"
	"plutomi/shared/utils"

	"github.com/jmoiron/sqlx"
	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

type MessageHandler func(consumer *PlutomiConsumer, record *kgo.Record) error

type PlutomiConsumer struct {
	client  *kgo.Client
	handler MessageHandler

	Logger *zap.Logger
	MySQL  *sqlx.DB
	Ctx    *types.AppContext
}

// Starts a consumer that listens on the supplied topic
func CreateConsumer(consumer_name string, topic constants.KafkaTopic, group constants.ConsumerGroup, handler MessageHandler) {
	// Initialize the environment variables
	env := utils.LoadEnv("../../../.env")

	// Initialize the logger
	logger := utils.GetLogger(consumer_name, env)
	defer logger.Sync()

	// Initialize MySQL
	mysql := clients.GetMySQL(logger, consumer_name, env)
	defer mysql.Close()

	// Initialize the Kafka client
	kafka := clients.GetKafka([]string{env.KafkaUrl}, group, topic, logger)

	// Initialize the AppContext
	ctx := &types.AppContext{
		Env:         env,
		Logger:      logger,
		Application: consumer_name,
		MySQL:       mysql,
		Kafka:       kafka,
	}

	ctx.Logger.Info("Created Kafka client", zap.String("groupID", string(group)), zap.String("topic", string(topic)))

	consumer := &PlutomiConsumer{
		client:  kafka,
		handler: handler,
		Logger:  ctx.Logger,
		MySQL:   ctx.MySQL,
		Ctx:     ctx,
	}

	// Graceful shutdown
	go_context, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt)
	go func() {
		<-sigs
		fmt.Println("Shutting down consumer...")
		consumer.client.Close()
		cancel()
	}()

	logger.Info("Starting consumer", zap.String("groupID", string(constants.ConsumerGroupNotifications)), zap.String("topic", string(constants.TopicAuth)))
	// Run the consumer
	consumer.Run(go_context)
}

func (pc *PlutomiConsumer) Run(ctx context.Context) {
	for {
		pc.Logger.Debug("Polling for messages...")
		fetches := pc.client.PollFetches(ctx)
		if fetches.IsClientClosed() {
			pc.Logger.Info("Client closed, shutting down")
			return
		}

		fetches.EachError(func(t string, p int32, err error) {
			pc.Logger.Fatal("Error fetching from topic", zap.String("topic", t), zap.Int32("partition", p), zap.Error(err))
		})

		if fetches.Empty() {
			pc.Logger.Debug("No messages to process")
		}

		fetches.EachRecord(func(record *kgo.Record) {
			pc.Logger.Info("Received message", zap.String("key", string(record.Key)), zap.String("value", string(record.Value)))
			err := pc.handler(pc, record)

			if err != nil {
				pc.Logger.Error("Failed to process message", zap.Error(err))
				// Publish to next topic
				nextTopic := getNextTopic(constants.KafkaTopic(record.Topic))

				if nextTopic != "" {
					err := pc.publishToTopic(nextTopic, record)
					if err != nil {
						pc.Logger.Error("Failed to publish to topic", zap.String("topic", string(nextTopic)), zap.Error(err))
						// Don't commit the message so it gets reprocessed
						return
					}
					pc.client.CommitRecords(ctx, record)
					pc.Logger.Info("Message published to topic", zap.String("topic", string(nextTopic)))
					return
				}

				pc.Logger.Warn("No next topic found, will not retry,", zap.String("topic", record.Topic))
				pc.client.CommitRecords(ctx, record)
				return

			}

			pc.Logger.Info("Message processed successfully", zap.String("key", string(record.Key)), zap.String("value", string(record.Value)))
			pc.client.CommitRecords(ctx, record)
		})
	}
}

func getNextTopic(currentTopic constants.KafkaTopic) constants.KafkaTopic {
	if currentTopic == constants.TopicAuth {
		return constants.TopicAuthRetry
	}

	if currentTopic == constants.TopicAuthRetry {
		return constants.TopicAuthDLQ
	}

	return ""
}

func (pc *PlutomiConsumer) publishToTopic(topic constants.KafkaTopic, record *kgo.Record) error {
	newRecord := &kgo.Record{
		Topic: string(topic),
		Key:   record.Key,
		Value: record.Value,
	}

	err := pc.client.ProduceSync(context.Background(), newRecord).FirstErr()

	return err
}
