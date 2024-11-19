package consumers

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	clients "plutomi/shared/clients"
	"plutomi/shared/constants"
	"plutomi/shared/utils"

	ctx "plutomi/shared/context"

	"github.com/jmoiron/sqlx"
	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

type MessageHandler func(consumer *PlutomiConsumer, record *kgo.Record) error

type PlutomiConsumer struct {
	Kafka  clients.PlutomiKafka
	handler MessageHandler
	Application string
	Logger *zap.Logger
	MySQL  *sqlx.DB
	Ctx    *ctx.AppContext
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
	kafka := clients.NewKafka([]string{env.KafkaUrl}, group, topic, logger)
	defer kafka.Close()

	// Initialize the AppContext
	ctx := &ctx.AppContext{
		Env:         env,
		Logger:      logger,
		Application: consumer_name,
		MySQL:       mysql,
		Kafka:       kafka,
	}

	ctx.Logger.Info("Created Kafka client", zap.String("groupID", string(group)), zap.String("topic", string(topic)))

	consumer := &PlutomiConsumer{
		Kafka:  *kafka,
		handler: handler,
		Logger:  ctx.Logger,
		MySQL:   ctx.MySQL,
		Application: consumer_name,
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
		consumer.Kafka.Close()
		cancel()
	}()

	logger.Info("Starting consumer", zap.String("groupID", string(constants.ConsumerGroupNotifications)), zap.String("topic", string(constants.TopicAuth)))
	// Run the consumer
	consumer.Run(go_context)
}

func (pc *PlutomiConsumer) Run(ctx context.Context) {
	for {
		pc.Logger.Debug("Polling for messages...")
		fetches := pc.Kafka.Client.PollFetches(ctx)
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
				nextTopic := pc.Kafka.GetNextTopic(constants.KafkaTopic(record.Topic))

				if nextTopic != "" {
					err := pc.Kafka.PublishToTopic(nextTopic, string(record.Key), record.Value)
					if err != nil {
						pc.Logger.Error("Failed to publish to topic", zap.String("topic", string(nextTopic)), zap.Error(err))
						// Don't commit the message so it gets reprocessed
						return
					}
					pc.Kafka.Client.CommitRecords(ctx, record)
					pc.Logger.Info("Message published to topic", zap.String("topic", string(nextTopic)))
					return
				}

				pc.Logger.Warn("No next topic found, will not retry,", zap.String("topic", record.Topic))
				pc.Kafka.Client.CommitRecords(ctx, record)
				return

			}

			pc.Logger.Info("Message processed successfully", zap.String("key", string(record.Key)), zap.String("value", string(record.Value)))
			pc.Kafka.Client.CommitRecords(ctx, record)
		})
	}
}



