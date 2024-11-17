package constants

type KafkaTopic string
type ConsumerGroup string


const (
    TopicAuth      KafkaTopic = "auth"
    TopicAuthRetry KafkaTopic = "auth-retry"
    TopicAuthDLQ   KafkaTopic = "auth-dlq"

    TopicTest     KafkaTopic = "test"
    TopicTestRetry KafkaTopic = "test-retry"
    TopicTestDLQ  KafkaTopic = "test-dlq"
)

const (
    ConsumerGroupNotifications ConsumerGroup = "notifications"
)
