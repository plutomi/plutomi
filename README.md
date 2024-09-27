# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

## Introduction

Plutomi was inspired by my experience at [Grubhub](grubhub.com), where managing the recruitment, screening, and onboarding of thousands of contractors every month was a significant challenge. Many of these processes were manual, making it difficult to adapt to our constantly changing business needs. I set out to create an open, flexible, and customizable platform that could automate and streamline these workflows.

Plutomi allows you to create applications for anything from jobs to program enrollments, each with customizable stages, where you can setup rules and automated workflows based on applicant responses or after a certain time period. Here's an example of how a delivery driver application might look like:

1. **Questionnaire** - Collects basic applicant info. Applicants move to the waiting list if not completed in 30 days.
2. **Waiting List** - Pool of idle applicants.
3. **Document Upload** - Collects required documents like licenses.
4. **Final Review** - Manual compliance check.
5. **Ready to Drive** - Applicants who have completed all stages and are approved. Automatically move to Onboarding after 2 hours.
6. **Onboarding** - Sends onboarding emails and schedules training sessions.

## Architecture

Plutomi follows a modular monolith architecture, with a [Remix](https://remix.run/) frontend and an [Axum](https://github.com/tokio-rs/axum) API written in Rust. All core services rely on a single primary OLTP database—currently MongoDB, with plans to move to MySQL in the future. This database handles all operational data, rather than splitting data between consumers or services. Blob storage is managed via [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/), and features like search and analytics are powered by [OpenSearch](https://opensearch.org/) and [ClickHouse](https://clickhouse.tech/), with [Valkey](https://valkey.io/) providing caching & rate limiting.

Event-driven processing is powered by Kafka, based on [an architecture used at Uber](https://www.uber.com/en-JP/blog/reliable-reprocessing/). For each entity, we maintain a main Kafka topic along with corresponding retry and dead letter queue (DLQ) topics to handle failures gracefully. Messages that fail in the main topic can be rerouted to the retry topic, and if necessary, moved to the DLQ for further processing. This ensures smooth message flow without disrupting live traffic. All event processing is managed by independent consumers written in Rust, which communicate with Kafka rather than directly with each other or the API.

> For more details on the event streaming pipeline, refer to [EVENT_STREAMING_PIPELINE.md](./EVENT_STREAMING_PIPELINE.md)

We run on Kubernetes with [K3S](https://k3s.io/) and manage our infrastructure with AWS CDK [for now](https://github.com/plutomi/plutomi/issues/994). We use [SES](https://aws.amazon.com/ses/) to send emails and normalize those events into our Kafka topics. We also use [Linkerd](https://linkerd.io/) for service mesh and [Axiom](https://axiom.co/) for logging, but this is optional.

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [cmake](https://cmake.org/download/) - for [rdkafka dependency](https://github.com/fede1024/rust-rdkafka?tab=readme-ov-file#installation)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

To setup your datasources, simply run `docker compose up -d` to run the [docker-compose.yaml](./docker-compose.yaml) file. This will start MongoDB, Kafka with the required topics, and KafkaUI on ports 27017, 9092, and 9000 respectively.

> Credentials for all datasources are `admin` and `password`.

Then, simply copy the `.env.example` file to `.env` and execute the `run.sh` script to start the API, Web, and Consumer services.

```bash
$ cp .env.example .env
$ ./scripts/run.sh
```

You can also run any service individually:

```bash
$ ./scripts/run.sh --stack <web|api|consumers>
```

## Deploying

Plutomi is designed to be flexible and can be deployed anywhere you can get your hands on a server, we recommend at least 3. All Docker images are available on [Docker Hub](https://hub.docker.com/u/plutomi). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

## Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md). If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there.

If you have other questions, feel free to open a discussion or issue, or contact me on [X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.
