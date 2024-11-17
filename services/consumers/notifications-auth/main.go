package main

import (
	"fmt"

	"plutomi/shared/constants"
	"plutomi/shared/consumers"

	"github.com/twmb/franz-go/pkg/kgo"
	"go.uber.org/zap"
)

func SampleHandler(self *consumers.PlutomiConsumer, record *kgo.Record) error {
	msg := fmt.Sprintf("Received message in %s - publishing to retry!", self.Application)
	self.Logger.Info(msg, zap.String("key", string(record.Key)), zap.String("value", string(record.Value)))
	return fmt.Errorf("failed to process message")
}


func main() {
	consumers.CreateConsumer("notifications-auth-consumer", constants.TopicAuth, constants.ConsumerGroupNotifications, SampleHandler)
}
