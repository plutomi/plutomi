package constants

type KafkaTopic string
type ConsumerGroup string


const (
    TopicAuth      KafkaTopic = "auth"
    TopicAuthRetry KafkaTopic = "auth-retry"
    TopicAuthDLQ   KafkaTopic = "auth-dlq"
)

const (
    ConsumerGroupNotifications ConsumerGroup = "notifications"
)
