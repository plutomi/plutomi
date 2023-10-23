# Infrastructure for AWS

This sets up SES aside from the DNS records. You'll need to add those manually.

It also creates an SNS topic where email events are sent to. SNS publishes events to a queue, and we have a lambda function reading those events for processing.
