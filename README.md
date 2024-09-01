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

## Tech Stack

Plutomi is built using the following technologies:

- **Frontend**: [Remix](https://remix.run/) app with Express
- **API**: Written in Rust with the [Axum framework](https://github.com/tokio-rs/axum)
- **Database**: MongoDB, storing everything [in a single collection](https://youtu.be/IYlWOk9Hu5g?t=1094)
- **Message Broker & KV**: [NATS + JetStream](https://docs.nats.io/)

- **Event Consumers**: Written in Rust handling all asynchronous events
  > For more details on our event driven architecture, including retry mechanisms, DLQs, and consumers, see the [Event Streaming Pipeline Docs](./EVENT_STREAMING_PIPELINE.md)
- **Emails**: [SES](https://aws.amazon.com/ses/) + SNS & SQS for handling email events
- **Logging**: [Axiom](https://axiom.co/) _(optional)_
- **Storage & Misc**: Cloudflare for DNS, CDN, WAF, and storage (R2)

- **Orchestration**: Kubernetes using [K3S](https://k3s.io/)
- **Infrastructure Management**: We use [AWS CDK](https://aws.amazon.com/cdk/) to deploy AWS services. We plan to [migrate to Terraform](https://github.com/plutomi/plutomi/issues/994) for consolidating all infrastructure management in one tool

We _plan_ to integrate:

- **Search**: MeiliSearch
- **Analytics**: ClickHouse

## Running Locally

**Prerequisites:**

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

Simply copy the `.env.example` file to `.env` and execute the `run.sh` script:

```bash
$ cp .env.example .env
$ ./scripts/run.sh
```

This will setup MongoDB, NATS + Jetstream, start the web app on port 3000, and the API on port 8080. A few notes:

- Credentials for all datasources when testing locally are `admin` and `password`.
- The NATS server will be created with a `sys` user to manage it, and an `admin` user for creating streams & publishing/subscribing to messages.

You can also run any stack individually:

```bash
$ ./scripts/run.sh --stack <web|api|datasources|consumer> TODO, also do mongodb and nats separately?
```

#### Deploying

Plutomi can be deployed to any VPS, we recommend [Hetzner](https://hetzner.cloud/?ref=7BufEUOAUm8x).
Check out [DEPLOYING.md](DEPLOYING.md) for more information.

#### Questions / Troubleshooting

Some common issues are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there.

If you have other questions, feel free to open a discussion or issue, or [contact me on X @notjoswayski](https://twitter.com/notjoswayski) or via email at jose@plutomi.com.

---
