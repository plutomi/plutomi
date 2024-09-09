# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

TODO Add table of contents

## Introduction

Plutomi was inspired by my experience at [Grubhub](grubhub.com), where managing the recruitment, screening, and onboarding of thousands of contractors every month was a significant challenge. Many of these processes were manual, making it difficult to adapt to our constantly changing business needs. I set out to create an open, flexible, and customizable platform that could automate and streamline these workflows.

## Summary

Plutomi allows you to create `applications` for anything from jobs to program enrollments, each with customizable `stages`. These stages represent individual steps in the application process, where you can add `questions` and set up automated `rules` to guide applicants based on their responses or after a certain time period. Here's what a typical setup might look like for a delivery driver application:

1. **Questionnaire** - Collect basic applicant information. Automatically move applicants to the _Waiting List_ if not completed within 30 days.
2. **Waiting List** - An idle pool of applicants.
3. **Document Upload** - Collect the applicant's license.
4. **Final Review** - Manually review the license for compliance.
5. **Ready to Drive** - Applicants who have completed all stages and are approved.

## Tech Stack

The frontend is built with [Remix](https://remix.run/) and [Express](https://expressjs.com/), while the API is written in Rust using the [Axum framework](https://github.com/tokio-rs/axum). All data is stored [in a single collection](https://youtu.be/IYlWOk9Hu5g?t=1094), and we use [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) for blob storage. The event-driven architecture is powered by [NATS + JetStream](https://docs.nats.io/), as well as certain KV operations. We send emails with SES + SNS and SQS for those events. All asynchronous events are handled by Rust services, including normalizing SES events into NATS. We use Axiom for logging and Kubernetes with [K3S](https://k3s.io/) for orchestration. We plan to add [MeiliSearch](https://www.meilisearch.com/) for search and [ClickHouse](https://clickhouse.tech/) for analytics.

### Event Streaming Pipeline

TODO add summary
The structure is highly configurable, allowing for easy addition of new event types and consumers as the application grows.
It leverages NATS JetStream features like durable consumers and filtered subjects, which provide fine-grained control over message processing.

Key Components:
TODO add table of contents

#### Streams

The pipeline defines three main streams:

**events**: The primary stream where events are first published
**events-retry**: Handles retrying failed events
**events-dlq**: A final destination for events that fail to process after multiple attempts

> Retry & DLQ streams do not store duplicate copies of messages. Instead, they receive a pointer ([MAX_DELIVERIES advisory](https://docs.nats.io/using-nats/developer/develop_jetstream/consumers#dead-letter-queues-type-functionality)) that references the original message in the **events** stream. This ensures the events stream remains the single source of truth, maintaining data integrity and simplifying error handling by always processing the original event data and one

#### Consumers

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

Custom error handling and advisory message processing are integrated to ensure robustness.
The system is configuration-driven, allowing easy adjustments to streams, consumers, and their behaviors without modifying the core codebase.

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [cmake](https://cmake.org/download/) - for `rdkafka` crate
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [RFK cli](https://www.redpanda.com/blog/homebrew) brew install redpanda-data/tap/redpanda

Simply copy the `.env.example` file to `.env` and execute the `run.sh` script:

```bash
$ cp .env.example .env
$ ./scripts/run.sh
```

This will setup:

- MongoDB on port 27017
- 3 Redpanda brokers
- Redpanda console on port 9000
- Web app on port 3000
- API on port 8080
- All of the Redpanda consumers:
  - TODO

> Credentials for all datasources for all other interactions are `admin` and `password`.

You can also run any stack individually:

```bash
$ ./scripts/run.sh --stack <web|api|datasources|consumer> TODO consumer
```

#### Deploying and Self-Hosting

Plutomi is designed to be flexible and can be deployed on any VPS (_we recommend [Hetzner](https://hetzner.cloud/?ref=7BufEUOAUm8x)_). While we use Kubernetes, it’s not a requirement. All Docker images are available on [Docker Hub](https://hub.docker.com/u/plutomi). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

#### Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md). If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there. If you have other questions, feel free to open a discussion or issue, or [contact me on X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.

---
