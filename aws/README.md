# Infrastructure for AWS

This sets up SES aside from the DNS records. You'll need to add those manually.

It also creates an SNS topic where email events are sent to. SNS publishes events to a queue, and we have a lambda function reading those events for processing.

TODO: Use Nodemailer (or rust alternative) + Ethereal for testing emails locally.
https://nodemailer.com/about/

TODO
