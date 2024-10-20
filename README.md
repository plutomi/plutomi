# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

## Introduction

Plutomi was inspired by my experience at [Grubhub](grubhub.com), where managing the recruitment, screening, and onboarding of thousands of contractors every month was a significant challenge. Many of these processes were manual, making it difficult to adapt to our constantly changing business needs. I set out to create an open, flexible, and customizable platform that could automate and streamline these workflows.

Plutomi allows you to create applications for anything from jobs to program enrollments, each with customizable stages, where you can setup rules and automated workflows based on applicant responses or after a certain time period. Here's an example of how a delivery driver application might look like:

1. **Questionnaire** - Collects basic applicant info. Applicants are moved to the waiting list if not completed in 30 days.
2. **Waiting List** - Pool of idle applicants.
3. **Document Upload** - Collects required documents like licenses and insurance.
4. **Final Review** - Manual compliance check.
5. **Ready to Drive** - Applicants who have completed all stages and are approved. Triggers account creation in an external system via webhook.
6. **Account Creation Failures** - Holds applicants whose account creation failed, allowing for troubleshooting and resolution.

## Architecture

Plutomi follows a modular monolith architecture, featuring a [Remix](https://remix.run/) frontend and an [Axum](https://github.com/tokio-rs/axum) API written in Rust. All core services rely on a single primary OLTP database, MySQL, which handles all operational data rather than splitting data between consumers or services. Blob storage is managed by [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/), while features like search and analytics are powered by [OpenSearch](https://opensearch.org/) and [ClickHouse](https://clickhouse.com/). [Valkey](https://valkey.io/) provides caching & rate limiting.

### Infrastructure and Third-Party Tools

We run on Kubernetes ([K3S](https://k3s.io/)) and manage our infrastructure using AWS CDK [for now](https://github.com/plutomi/plutomi/issues/994). We use [SES](https://aws.amazon.com/ses/) to send emails and normalize those events into our Kafka topics. Optional components include [Linkerd](https://linkerd.io/) for service mesh, [Axiom](https://axiom.co/) for logging, and [Cloudflare](https://www.cloudflare.com/) for CDN.

### Event Streaming Pipeline

Our event streaming pipeline, modeled after [Uber's architecture](https://www.uber.com/en-JP/blog/reliable-reprocessing/), is powered by Kafka. All event processing is managed by independent consumers written in Rust, which communicate with Kafka rather than directly with each other or the API.

For each entity, we maintain a main Kafka topic along with corresponding retry and dead letter queue (DLQ) topics to handle failures gracefully:

- **Main Topic**: The initial destination for all events.

- **Retry Topic**: Messages that fail processing in the main topic are rerouted here. Retries implement exponential backoff to prevent overwhelming the system.

- **Dead Letter Queue (DLQ)**: If a message fails after multiple retries, it's moved to the DLQ for further investigation. Once underlying issues are resolved (e.g., code fixes, service restoration), the messages are reprocessed by moving them back into the retry topic in a controlled manner, ensuring they do not disrupt live traffic.

For more details on the event streaming pipeline and to view the events, refer to [EVENT_STREAMING_PIPELINE.md](./EVENT_STREAMING_PIPELINE.md).

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [cmake](https://cmake.org/download/) - for [rdkafka dependency](https://github.com/fede1024/rust-rdkafka?tab=readme-ov-file#installation)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

To setup your datasources, simply run `docker compose up -d` to run the [docker-compose.yaml](./docker-compose.yaml) file. This will start MySQL, Kafka with the required topics, and KafkaUI on ports 3306, 9092, and 9000 respectively.

> Credentials for all datasources are `admin` and `password`.

Then, simply copy the `.env.example` file to `.env` and execute the `run.sh` script which will run migrations for MySQL (using the `migrator` service) and start the API and Web services, along with the kafka consumers.

```bash
$ cp .env.example .env
$ ./scripts/run.sh
```

You can also run any service individually:

```bash
$ ./scripts/run.sh --service <web|api|migrator|consumers>
```

## Deploying

Plutomi is designed to be flexible and can be deployed anywhere you can get your hands on a server, we recommend at least 3. All Docker images are available on [Docker Hub](https://hub.docker.com/u/plutomi). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

## Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md). If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there.

If you have other questions, feel free to open a discussion or issue, or contact me on [X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.
