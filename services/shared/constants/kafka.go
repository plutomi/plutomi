package constants

type KafkaTopic string
type ConsumerGroup string

// ! If you modify this, make sure to modify the NextTopicMap below as well as the docker-compose.yaml to create the topic for dev
const (
	
	TopicTest      KafkaTopic = "test"
	TopicTestRetry KafkaTopic = "test-retry"
	TopicTestDLQ   KafkaTopic = "test-dlq"

	TopicAuth      KafkaTopic = "auth"
	TopicAuthRetry KafkaTopic = "auth-retry"
	TopicAuthDLQ   KafkaTopic = "auth-dlq"


)

var NextTopicMap = map[KafkaTopic]KafkaTopic{
	TopicTest:      TopicTestRetry,
	TopicTestRetry: TopicTestDLQ,
	TopicTestDLQ:   "",

	TopicAuth:      TopicAuthRetry,
	TopicAuthRetry: TopicAuthDLQ,
	TopicAuthDLQ:   "",
}

const (
	ConsumerGroupNotifications ConsumerGroup = "notifications"
)
