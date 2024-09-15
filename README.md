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

The frontend is built with [Remix](https://remix.run/) and [Express](https://expressjs.com/), while the API is written in Rust using the [Axum framework](https://github.com/tokio-rs/axum). All data is stored [in a single collection](https://youtu.be/IYlWOk9Hu5g?t=1094) inside [MongoDB](https://mongodb.com/), and we use [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) for blob storage. The event-driven architecture is powered by [Kafka](https://kafka.apache.org/), and we use [Valkey](https://valkey.io/) for rate limiting mostly. We send emails with SES, and setup SNS and SQS for email events. We have a handful of consumers all written in Rust which do all asynchronous work. We use Axiom for logging and Kubernetes with [K3S](https://k3s.io/) for orchestration. We plan to add [MeiliSearch](https://www.meilisearch.com/) for search and [ClickHouse](https://clickhouse.tech/) for analytics.

### Event Streaming Pipeline

We have a typical setup of three streams per _entity_ if you will: a main stream, a retry stream, and a DLQ stream, loosely based off of [Uber's Kafka Architecture](https://www.uber.com/en-JP/blog/reliable-reprocessing/).

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [cmake](https://cmake.org/download/) - for `rdkafka` crate
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

To setup your datasources, simply run `docker compose up -d` to run the [docker-compose.yaml](./docker-compose.yaml) file. This will start MongoDB, Kafka with the required topics, and KafkaUI on ports 27017, 9092, and 9000 respectively.

Then, simply copy the `.env.example` file to `.env` and execute the `run.sh` script to start the API, Web, and Consumer services.

```bash
$ cp .env.example .env
$ ./scripts/run.sh
```

> Credentials for all datasources are `admin` and `password`.

You can also run any stack individually:

```bash
$ ./scripts/run.sh --stack <web|api|consumers>
```

#### Deploying and Self-Hosting

Plutomi is designed to be flexible and can be deployed on any environment and it is highly recommended to have three nodes. All Docker images are available on [Docker Hub](https://hub.docker.com/u/plutomi). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

#### Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md). If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there. If you have other questions, feel free to open a discussion or issue, or [contact me on X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.
