### Plutomi Services

Plutomi is composed of a web app, an API, and multiple asynchronous consumers. They should never talk to each other directly, and should always publish events to NATS for other services to consume. The web app will talk to the API directly, and the API will talk to the consumers via NATS.
