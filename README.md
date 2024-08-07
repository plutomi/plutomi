# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](./images/infra.png)

## Motivation

Having worked at a company that needed to recruit thousands of contractors every month, improving our acquisition flow at that scale became a challenge. Many processes had to be done manually because there just wasn't an API available for it. We often hit limits and had to work around them with a myriad of webhooks, queues, and batch jobs to keep things running smoothly. It would have benefited us to have an open platform to contribute to and build upon and this project is [my](https://twitter.com/notjoswayski) attempt to do just that.

## Summary

You can create `applications` which people can apply to. An application can be anything from a job, a location for a delivery company, or a program like a summer camp.

In these applications, you can create `stages` which are individual steps that need to be completed by your `applicants`. You can add `questions` and setup automatic move `rules` that determine where applicants go next depending on their `responses` or after a certain time period.

An application for a delivery company might look like this:

**New York City**

Stages:

1. **Questionnaire** - Collect basic information of an applicant. If an applicant does not complete this stage in 30 days, move them to the _Waiting List_.
2. **Waiting List** - An idle pool of applicants
3. **Document Upload** - Collect an applicant's license
4. **Final Review** - Manually review an applicant's license for compliance
5. **Ready to Drive** - Applicants that have completed your application

## Prerequisites

- [Node 20](https://nodejs.org/en/download)
- [Rust](https://www.rust-lang.org/tools/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) - For local development
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) and [SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

## Tech Stack

Plutomi is deployed to any VPS you can get your hands on ([we recommend Hetzner](https://hetzner.cloud/?ref=7BufEUOAUm8x)). The frontend is a [Remix](https://remix.run/) app and the API is written in [Rust](https://www.rust-lang.org/) using the [Axum](https://github.com/tokio-rs/axum) web framework. We use [Traefik](https://traefik.io/) as ingress with [cert-manager + Let's Encrypt](https://letsencrypt.org/) for TLS certificates. We use [MongoDB](https://www.mongodb.com/) for our main transactional database and try to follow patterns like [this](https://youtu.be/IYlWOk9Hu5g?t=1094) where we store everything in a single collection. We use [NATS + Jetstream](https://nats.io/) as a message broker for async events.

We use [AWS CDK](https://aws.amazon.com/cdk/) to deploy a couple of resources like setting up [SES](https://aws.amazon.com/ses/) for emails, [SNS](https://aws.amazon.com/sns/) to receive email events like opens, clicks, bounces, etc., and a [queue](https://aws.amazon.com/sqs/) to put those events in.

We also use [Cloudflare](https://www.cloudflare.com/) for DNS, CDN, WAF and R2 for storage, and [Axiom](https://axiom.co/) for logging although this is optional.

We _plan_ to add:

- An events consumer to process NATS and SQS messages
- MeiliSearch for full text search
- ClickHouse for analytics

### Running Locally

Simply make a copy of [.env.example](.env.example) to a `.env` file and run `./scripts/run.sh`. This will:

1. Setup MongoDB

2. Setup NATS + Jetstream

> Credentials for all datasources when testing locally are `admin` and `password`.
> The NATS server will be created with a `sys` user to manage it, and an `admin` user for creating streams & publishing/subscribing to messages.
> You can create a NATS context to switch between them easily:

```bash
$ nats context add admin --server nats://localhost:4222 --user admin --password "password"  --description "Admin user" --select
```

3. Start the Web app in development mode on port 3000

4. Start the API on port 8080

- Because the majority of our backend is in Rust, _and due to the infamous compile times of Rust_, we are running them outside of Docker
- The API along with the events consumer will run with `cargo watch` which might take some time to initially start but will have hot reloading after that

You can also run any stack individually:

```bash
$ ./scripts/run.sh --stack <web|api|datasources>
```

##### Local Docker

If you decide to run any of the Rust services in Docker, make sure you run them from the `/services` directory and pass the service Dockerfile as context as we need the `/shared` library to be included:

```bash
# Running the API example in /services
docker build -t plutomi/api:latest-local -f api/Dockerfile . && \
docker run -p 8080:8080 plutomi/api:latest-local
```

## Deploying

To deploy Plutomi, you'll want to deploy to AWS for setting up SES first and then the rest of the backend with Kubernetes (K3S). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

## License

This project is licensed under the [Apache 2.0 license](LICENSE). Here is a [TLDR](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Useful Links

- [plutomi.com](https://plutomi.com)
- [Plutomi Docs](https://plutomi.com/docs)
- [K3S](https://k3s.io)
- [Rust Docs](https://doc.rust-lang.org/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [NATS Docs](https://docs.nats.io/)
- [Remix Docs](https://remix.run/docs/en/main)
- [Multipass](https://multipass.run/)

## Questions / Troubleshooting

Some common issues you might run into are documented in [TROUBLESHOOTING.md](TROUBLESHOOTING.md), be sure to look there first :)

If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there.

If you have any other questions, open a discussion / issue and we can talk about it or reach out to me on Twitter [@notjoswayski](https://twitter.com/notjoswayski) or email jose@plutomi.com!
