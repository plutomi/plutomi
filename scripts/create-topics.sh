#!/bin/bash

echo 'Waiting for Kafka to be reachable...'

# Blocks until Kafka is reachable
while ! /opt/bitnami/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 --list > /dev/null 2>&1; do
  echo 'Kafka is not reachable yet, retrying...'
  sleep 5
done

echo 'Kafka is reachable, creating topics...'

# Define a list of topics
topics=(test test-retry test-dlq another-topic more-topics topic50)

# Iterate through the topics list and create each one
for topic in "${topics[@]}"; do
  /opt/bitnami/kafka/bin/kafka-topics.sh --create --topic "$topic" --if-not-exists --bootstrap-server kafka:9092 --partitions 1 --replication-factor 1 && echo "Topic $topic created or already exists."
done

echo 'Successfully created all topics.'
