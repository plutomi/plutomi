### Events Consumer

This service is responsible for consuming events from the event bus and processing them. It also reads from the email events SQS queue, normalizes those events, and sends them to NATS for further processing. We spawn multiple threads for each event category like reading from the SQS queue, our own internal priority queue, notifications, webhooks, ETL for analytics and search, and more.
