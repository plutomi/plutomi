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

Plutomi is deployed to any VPS you can get your hands on ([we recommend Hetzner](https://hetzner.cloud/?ref=7BufEUOAUm8x)). The frontend is a [Remix](https://remix.run/) app and the API is written in [Rust](https://www.rust-lang.org/) using the [Axum](https://github.com/tokio-rs/axum) web framework. We use [Traefik](https://traefik.io/) as ingress with [cert-manager + Let's Encrypt](https://letsencrypt.org/) for TLS certificates. We use [MongoDB](https://www.mongodb.com/) for our main transactional database and try to follow patterns like [this](https://youtu.be/IYlWOk9Hu5g?t=1094) where we store everything in a single collection.

We use [AWS CDK](https://aws.amazon.com/cdk/) to deploy a couple of resources like setting up [SES](https://aws.amazon.com/ses/) for emails, [SNS](https://aws.amazon.com/sns/) to receive email events like opens, clicks, bounces, etc., and a [queue](https://aws.amazon.com/sqs/) to put those events in.

We also use Cloudflare for DNS, CDN, WAF and R2 for storage.

We _plan_ to add:

- NATS for asynchronous communication streams
- Multiple consumers to read from NATS Jetstream and the email events queue
- MeiliSearch/ElasticSearch for full text search
- DuckDB/ClickHouse for analytics
- Prometheus/Loki/Grafana for monitoring & logging

### Running Locally

Simply make a copy of [.env.example](.env.example) to a `.env` file and run `./scripts/run.sh`. This will:

1. Setup MongoDB for you

- Credentials are in the [docker-compose.yaml](./docker-compose.yaml)

2. Start the Web app in development mode on port 3000

3. Start the API on port 8080

- Because the majority of our backend is in Rust, _and due to the infamous compile times of Rust_, we are running them outside of Docker
- The API along with any future consumers will run with `cargo watch` which might take some time to initially start but will have hot reloading after that

You can also run any stack individually:

```bash
$ ./scripts/run.sh --stack <web|api|datasources>
```

## Deploying

To deploy Plutomi, you'll want to deploy to AWS for setting up SES first and then the rest of the backend with Kubernetes (K3S). Check out [DEPLOYING.md](DEPLOYING.md) for more information.

## License

This project is licensed under the [Apache 2.0 license](LICENSE). Here is a [TLDR](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).

## Useul Links

- [plutomi.com](https://plutomi.com)
- [Plutomi Docs](https://plutomi.com/docs)
- [K3S](https://k3s.io)
- [Rust Docs](https://doc.rust-lang.org/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [NATS Docs](https://docs.nats.io/)
- [Remix Docs](https://remix.run/docs/en/main)
- [Multipass](https://multipass.run/)

## Contributing & Contributors

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

Thanks goes to these wonderful people who contributed!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/joswayski"><img src="https://avatars.githubusercontent.com/u/22891173?v=4?s=100" width="100px;" alt="Jose Valerio"/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=joswayski" title="Code">💻</a> <a href="#infra-joswayski" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-joswayski" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/praguru14"><img src="https://avatars.githubusercontent.com/u/48213609?v=4?s=100" width="100px;" alt="praguru14"/><br /><sub><b>praguru14</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=praguru14" title="Code">💻</a> <a href="#maintenance-praguru14" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mazupicua"><img src="https://avatars.githubusercontent.com/u/37680756?v=4?s=100" width="100px;" alt="Jose Valerio"/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=mazupicua" title="Code">💻</a> <a href="#maintenance-mazupicua" title="Maintenance">🚧</a> <a href="https://github.com/plutomi/plutomi/issues?q=author%3Amazupicua" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jeremyjay121"><img src="https://avatars.githubusercontent.com/u/94778748?v=4?s=100" width="100px;" alt="Jeremy Trenchard"/><br /><sub><b>Jeremy Trenchard</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=Jeremyjay121" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CodingRubix"><img src="https://avatars.githubusercontent.com/u/94731024?v=4?s=100" width="100px;" alt="CodingRubix"/><br /><sub><b>CodingRubix</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=CodingRubix" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jlittlewood-scottlogic"><img src="https://avatars.githubusercontent.com/u/124571917?v=4?s=100" width="100px;" alt="jlittlewood-scottlogic"/><br /><sub><b>jlittlewood-scottlogic</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=jlittlewood-scottlogic" title="Code">💻</a> <a href="#design-jlittlewood-scottlogic" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Questions?

If you're wondering why certain architectural decisions were made, check the [decisions](./decisions/README.md) folder as you might find it in there. If it's not in there or you have any other questions, open a discussion or an issue and we can talk about it, or reach out to me on [Twitter @notjoswayski](https://twitter.com/notjoswayski) or email jose@plutomi.com!
