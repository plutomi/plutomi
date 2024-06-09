## NATS

[https://nats.io/](https://nats.io/)

We will be using NATS for our messaging system. Consumers / API should never talk to each other, instead they should publish messages to NATS and let the other services consume them. We _do not_ want to have a microservices architecture with a ton of network calls back and forth.
