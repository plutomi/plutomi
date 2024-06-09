### Webhook Sender

This consumer picks up most events and checks if that organization has webhooks enabled for that event. If it does, it sends the event to the webhook URL. This is how we integrate with other systems like Slack, Discord, and Zapier.
