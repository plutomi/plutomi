# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

## Introduction

Plutomi was inspired by my experience at [Grubhub](grubhub.com), where managing the recruitment, screening, and onboarding of thousands of contractors every month was a significant challenge. Many of these processes were manual, making it difficult to adapt to our constantly changing business needs. I set out to create an open, flexible, and customizable platform that could automate and streamline these workflows.

## Summary

Plutomi allows you to create `applications` for anything from jobs to program enrollments, each with customizable `stages`. These stages represent individual steps in the application process, where you can add `questions` and set up automated `rules` to guide applicants based on their responses or after a certain time period. Here's what a typical workflow might look like for a delivery driver application:

1. **Questionnaire** - Collect basic applicant information. Automatically move applicants to the _Waiting List_ if not completed within 30 days.
2. **Waiting List** - An idle pool of applicants.
3. **Document Upload** - Collect the applicant's license.
4. **Final Review** - Manually review the license for compliance.
5. **Ready to Drive** - Applicants who have completed all stages and are approved.

## Tech Stack

The frontend is a [Remix](https://remix.run/) app, and the API is built in Rust using the [Axum framework](https://github.com/tokio-rs/axum). Our main database is MongoDB, storing everything [in a single collection](https://youtu.be/IYlWOk9Hu5g?t=1094). [NATS + Jetstream](https://nats.io/) serves as our message broker for asynchronous events. More info can be found HERE for our event streaming pipeline TODO TODO TODO.

Additional resources like SES, SNS, and SQS are deployed via [AWS CDK](https://aws.amazon.com/cdk/). We also use [Cloudflare](https://www.cloudflare.com/) for DNS, CDN, WAF, and storage (R2), and [Axiom](https://axiom.co/) for optional logging.

We _plan_ to integrate:

- MeiliSearch for full text search
- ClickHouse for analytics

Plutomi can be deployed to any VPS, we recommend [Hetzner](https://hetzner.cloud/?ref=7BufEUOAUm8x). We run everything on Kubernetes using [K3S](https://k3s.io/).

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

##### Running locally

Simply make a copy of [.env.example](.env.example) to a `.env` file and run `./scripts/run.sh`. This will setup MongoDB, NATS + Jetstream, start the web app on port 3000, and the API on port 8080.

> Credentials for all datasources when testing locally are `admin` and `password`.
> The NATS server will be created with a `sys` user to manage it, and an `admin` user for creating streams & publishing/subscribing to messages.
> You can create a NATS context to switch between them easily:

```bash
$ nats context add admin --server nats://localhost:4222 --user admin --password "password"  --description "Admin user" --select
```

> Due to long compile times in Rust, the API and events-consumer are run outside of Docker with `cargo watch`.

You can also run any service individually:

```bash
$ ./scripts/run.sh --stack <web|api|datasources|consumer> TODO
```

##### Local Docker

If you decide to run any of the Rust services in Docker, make sure you run them from the `/services` directory and pass the service Dockerfile as context as we need the `/shared` library to be included:

```bash
# Running the API example in /services
docker build -t plutomi/api:latest-local -f api/Dockerfile . && \
docker run -p 8080:8080 plutomi/api:latest-local
```

### Deploying

Check out [DEPLOYING.md](DEPLOYING.md) for more information.

#### Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there.

If you have other questions, feel free to open a discussion or issue, or [contact me on X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.

---

// TODO
Event flow:

"totp.requested" event comes into the "events" stream
Clickhouse consumer processes it successfully
Email consumer fails to process it (due to SES being down)
After max delivery attempts, NATS publishes:
$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.events.email-consumer

DLQ Stream:

Yes, create a new stream for "DLQ.>"
This stream will contain references to failed messages, not the messages themselves

DLQ Handling:

Set up a consumer to listen to $JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.>
When an advisory is received, publish a message to the DLQ stream like:
"DLQ.events.email-consumer"
This message contains headers with the original message ID and stream

Reprocessing:

Create consumer(s) for the DLQ stream
When processing DLQ messages, use the headers to fetch the original message from the "events" stream
Call the appropriate handler based on the consumer name in the DLQ subject

Message existence:

Correct, only one version of the original message exists in the main "events" stream
The DLQ stream contains only references to these messages

todo:

. Consumer Hierarchy:
Business Logic Consumers:

Process core events like TOTPRequested.
Have retries and DLQ handling, ensuring resilience if something goes wrong in the primary processing.
Meta Consumers:

Handle failures in the business logic consumers (via MAX_DELIVERIES advisories).
Have their own retries and DLQs, adding another layer of fault tolerance.
Super-Meta Consumers:

Handle failures in the meta consumers, ensuring that even system-level events are robustly managed.
These consumers handle the edge cases where the meta handling itself fails, which is a critical part of making your system highly resilient. 2. Stream Design:
Events Stream: Holds the primary events like TOTPRequested.
Retry Stream: Catches events that need to be retried after a failure.
DLQ Stream: Stores events that failed even after retries, ensuring they don’t get lost. 3. Error Handling:
Retries: Each consumer layer (business, meta, and super-meta) has a retry mechanism to handle transient errors.
DLQs: Each consumer layer also has a DLQ to catch and log persistent failures, ensuring no message is lost.

Certainly! Based on the code you've provided, here's an overview of what's happening in your event streaming pipeline:

You're using NATS JetStream to create an event streaming system with retry and dead-letter queue (DLQ) functionality.
You have three main streams:

"events": for primary event processing
"events-retry": for retrying failed events
"events-dlq": for events that have failed all retry attempts

You have two types of consumers:
a. Meta consumers: These handle system advisory messages, particularly MAX_DELIVERIES events.
b. Business logic consumers: These handle actual business events (e.g., TOTPRequested).
The meta consumers are responsible for:

Monitoring MAX_DELIVERIES events for business logic consumers
Moving failed events to the appropriate retry or DLQ streams
Handling their own failure cases (meta-consumer-retry and meta-consumer-dlq)

The business logic consumers (e.g., notifications-consumer) process actual events like TOTPRequested.
You've implemented a waterfall retry mechanism:

If a business logic consumer fails, it's picked up by a meta-consumer
The meta-consumer moves it to the retry stream
If it fails in the retry stream, it's moved to the DLQ stream

NOTE: important
retry and DLQ streams never get a duplicate copy of a message, instead they get a pointer (the max delivery event) and then lookup the message in the main stream.

FINAL:

Plutomi NATS JetStream Event Streaming Pipeline Overview
The Plutomi NATS JetStream event streaming pipeline is a robust, event-driven architecture designed to handle various events reliably and efficiently within the Plutomi SaaS application. Leveraging NATS JetStream, this pipeline ensures that events are processed with built-in retry mechanisms, dead-letter queues (DLQ), and extensive logging for resilience, scalability, and observability.

Key Components:
Streams:

The pipeline defines three main streams: events, events-retry, and events-dlq.
Each stream represents different stages of event processing:
Events: The primary stream where events are first published.
Events-Retry: Handles retrying failed events.
Events-DLQ: A final destination for events that fail to process after multiple attempts.
Consumers:

Business Logic Consumers: Handle the core application events (e.g., notifications-consumer for processing notification events like sending TOTP emails).
Meta Consumers: These consumers handle system-level advisories, particularly MAX_DELIVERIES advisories when events fail to process after a maximum number of attempts.
Super-Meta-Consumers: An additional layer to manage failures within meta-consumers themselves. They ensure that even meta-consumer failures are handled by retrying them or moving them to their respective DLQ streams.
Event Types:

The system currently handles events like TOTPRequested but is designed to be extensible for other event types as the application evolves.
Error Handling:

The pipeline implements a sophisticated error handling mechanism using NATS JetStream’s MAX_DELIVERIES advisory to manage retries.
If an event fails to process, it’s moved through a sequence of retry attempts. If all retries fail, the event is sent to the events-dlq stream for manual intervention or further logging.
Note: The retry and DLQ handlers do not receive a direct copy of the original message. Instead, they look up the original message in the events stream based on information provided in the MAX_DELIVERIES advisory. This ensures that the exact original event data is used consistently across retries and error handling.
Logging:

Comprehensive logging is integrated throughout the pipeline to provide visibility into event processing, error handling, and system health. Logs capture everything from successful event handling to retry attempts and final DLQ placements.
Pipeline Flow:
Event Publication:

Events are published into the events stream, which acts as the entry point for the pipeline.
Primary Processing:

Business logic consumers process these events from the events stream. If an event fails to be processed, NATS generates a MAX_DELIVERIES advisory.
Retry Mechanism:

Meta-consumers capture these MAX_DELIVERIES advisories and republish the failed events to the events-retry stream.
Retry consumers then attempt to process the event again. This retry mechanism ensures that transient issues do not result in permanent data loss.
Dead Letter Queue (DLQ):

If all retry attempts fail, events are moved to the events-dlq stream.
DLQ consumers handle these final-stage events, often involving manual review or triggering alerts for further investigation.
Meta-Consumer Error Handling:

Super-meta-consumers are in place to handle failures within the meta-consumers. If a meta-consumer itself fails (e.g., fails to handle a MAX_DELIVERIES advisory), the super-meta-consumer will manage the retries and escalate to the DLQ if necessary.
Key Features:
Resilience: The pipeline’s multi-layered error handling ensures that no event is lost, and the system remains operational even under failure conditions.
Scalability: By separating consumers for different event types, the system can scale each component independently according to load.
Observability: Extensive logging throughout the pipeline provides deep insights into event flows, processing status, and error handling, making it easier to monitor and debug.
Flexibility: The structure is highly configurable, allowing for easy addition of new event types and consumers as the application grows.
Implementation Details:
The pipeline is implemented in Rust, utilizing an asynchronous programming model for high performance.
It leverages NATS JetStream features like durable consumers and filtered subjects, which provide fine-grained control over message processing.
Custom error handling and advisory message processing are integrated to ensure robustness.
The system is configuration-driven, allowing easy adjustments to streams, consumers, and their behaviors without modifying the core codebase.

and claude:
Overview:
This pipeline implements a robust event-driven architecture using NATS JetStream for handling various events in a SaaS application. It's designed to process events reliably, with built-in retry mechanisms and dead-letter queues (DLQ) for handling failures.
Key Components:

Streams:

Three main streams: "events", "events-retry", and "events-dlq"
Each stream handles different stages of event processing

Consumers:

Multiple consumers are defined for different purposes:
a. Business logic consumers (e.g., "notifications-consumer")
b. Meta consumers for handling system advisories (e.g., "meta-consumer")
c. Retry and DLQ consumers for error handling

Event Types:

Currently handles TOTPRequested events, but extensible for other event types

Error Handling:

Implements a sophisticated retry and DLQ system
Uses NATS JetStream's MAX_DELIVERIES advisory to manage retries

Logging:

Comprehensive logging throughout the pipeline for monitoring and debugging

Pipeline Flow:

Event Publication:

Events are published to the "events" stream

Primary Processing:

Business logic consumers (e.g., "notifications-consumer") process events from the "events" stream
If processing fails, NATS generates a MAX_DELIVERIES advisory

Retry Mechanism:

Meta consumers capture MAX_DELIVERIES advisories
Failed events are republished to the "events-retry" stream
Retry consumers attempt to process the event again

Dead Letter Queue:

If retries fail, events are moved to the "events-dlq" stream
DLQ consumers handle these events (e.g., for manual intervention or logging)

Meta-Consumer Error Handling:

The system also handles failures in meta-consumers themselves
Implements a "super-meta-consumer" system for handling meta-consumer failures

Key Features:

Resilience: Multiple layers of retry and error handling ensure no events are lost
Scalability: Separate consumers for different event types allow for independent scaling
Observability: Extensive logging provides insights into the system's operation
Flexibility: The structure allows easy addition of new event types and consumers

Implementation Details:

Uses Rust with async programming model
Leverages NATS JetStream features like durable consumers and filtered subjects
Implements custom error handling and advisory message processing
Uses a configuration-driven approach for defining streams and consumers

This pipeline provides a robust foundation for event-driven architectures, ensuring reliable processing of events with sophisticated error handling and observability. It's particularly well-suited for SaaS applications that require high reliability and scalability in event processing.
