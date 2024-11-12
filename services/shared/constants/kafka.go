package constants
type Topics struct {
	Auth       string
	AuthRetry  string
	AuthDLQ    string
}

// ConsumerGroups struct with constant fields
type ConsumerGroups struct {
	Notifications string
}

// Initialize constants for Topics and ConsumerGroups
var KafkaTopics = Topics{
	Auth:      "auth",
	AuthRetry: "auth-retry",
	AuthDLQ:   "auth-dlq",
}

var KafkaConsumerGroups = ConsumerGroups{
	Notifications: "notifications",
}
