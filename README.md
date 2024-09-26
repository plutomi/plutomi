# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

## Introduction

Plutomi was inspired by my experience at [Grubhub](grubhub.com), where managing the recruitment, screening, and onboarding of thousands of contractors every month was a significant challenge. Many of these processes were manual, making it difficult to adapt to our constantly changing business needs. I set out to create an open, flexible, and customizable platform that could automate and streamline these workflows.

## Summary

Plutomi allows you to create `applications` for anything from jobs to program enrollments, each with customizable `stages`. These stages represent individual steps in the application process, where you can add `questions` and set up automated `rules` to guide applicants based on their responses or after a certain time period. Here's what a typical setup might look like for a delivery driver application:

1. **Questionnaire** - Collect basic applicant information. Automatically move applicants to the _Waiting List_ if not completed within 30 days.
2. **Waiting List** - An idle pool of applicants.
3. **Document Upload** - Collect the applicant's license.
4. **Final Review** - Manually review the license for compliance.
5. **Ready to Drive** - Applicants who have completed all stages and are approved.

## Architecture

As shown in the diagram above, Plutomi follows a modular monolith architecture. The core components include a [Remix](https://remix.run/) frontend and an [Axum](https://github.com/tokio-rs/axum) API. All data is stored in MongoDB [in a single collection](https://youtu.be/IYlWOk9Hu5g?t=1094), with [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) for blob storage. Features like search and analytics are powered by [OpenSearch](https://opensearch.org/) and [ClickHouse](https://clickhouse.tech/), with [Valkey](https://valkey.io/) for caching.

The system relies primarily on a single datastore, with asynchronous work handled by independent consumers written in Rust. These consumers process events without communicating directly with each other _or_ the API.

The event-driven architecture, inspired by [Uber's Kafka Architecture](https://www.uber.com/en-JP/blog/reliable-reprocessing/), uses three topics per entity: a `main` topic, a `retry` topic, and a `dlq` (Dead Letter Queue) topic for handling failures. This allows us to replay events, retry failed events, and handle errors gracefully.

For an in-depth overview of the Kafka topics and consumers, refer to the [EVENT_STREAMING_PIPELINE.md](./EVENT_STREAMING_PIPELINE.md)

We run on Kubernetes with [K3S](https://k3s.io/) and manage our infrastructure with AWS CDK [for now](https://github.com/plutomi/plutomi/issues/994). For emails, we use [SES](https://aws.amazon.com/ses/) and normalize those those events into our Kafka topics. We also use [Linkerd](https://linkerd.io/) for service mesh and [Axiom](https://axiom.co/) for logging, but this is optional.

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
