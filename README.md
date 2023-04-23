> :warning: **This repository is currently undergoing maintenance and many breaking changes. These changes are necessary to enhance the long term stability of the project. Use at your own risk as long as this banner is here - things _will_ be broken!**

---

# Plutomi

![build badge](https://github.com/plutomi/plutomi/actions/workflows/build.yml/badge.svg)
![linter badge](https://github.com/plutomi/plutomi/actions/workflows/linter.yml/badge.svg)
![spellcheck badge](https://github.com/plutomi/plutomi/actions/workflows/spellcheck.yml/badge.svg)
![prettier badge](https://github.com/plutomi/plutomi/actions/workflows/prettier.yml/badge.svg)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=plastic&color=informational)](http://makeapullrequest.com)
[![License](https://img.shields.io/github/license/plutomi/plutomi?style=plastic&color=important)](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0)
[![All Contributors](https://img.shields.io/badge/all_contributors-4-blue.svg?style=plastic&color=yellow)](#contributors)

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](images/infra.png)

## Motivation

Having worked at a company that needed to recruit thousands of contractors every month, improving our acquisition flow at that scale became a challenge. Many processes had to be done manually because there just wasn't an API available for it. We often hit limits and had to work around them with a myriad of webhooks, queues, and batch jobs to keep things running smoothly. It would have benefited us to have an open platform to contribute to and build upon and this project is [my](https://www.linkedin.com/in/joswayski/) attempt to do just that.

## Summary

You can create `applications` which people can apply to. An application can be anything from a job, a location for a delivery company, or a program like a summer camp.

In these applications, you can create `stages` which are individual steps that need to be completed by your `applicants`. You can add `questions` and setup automatic move `rules` that determine where applicants go next depending on their `answers` or after a certain time period.

An application for a delivery company might look like this:

**New York City**

Stages:

1. **Questionnaire** - Collect basic information of an applicant. If an applicant does not complete this stage in 30 days, move them to the _Waiting List_.
2. **Waiting List** - An idle pool of applicants
3. **Document Upload** - Collect an applicant's license
4. **Final Review** - Manually review an applicant's license for compliance
5. **Ready to Drive** - Applicants that have completed your application

## Prerequisites

- Node 18
- Install [Docker](https://docs.docker.com/get-docker/)
- Install the [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) `yarn global aws-cdk`
- Create a [Hosted Zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) in Route53 with your domain
- Create a [verified identity](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domain-procedure.html) with your domain in SES
- Create a [certificate for your domain](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html#request-public-console) in AWS Certificate Manager

## Useful Commands

- `yarn` - Install deps.
  - We are using a Monorepo so shared deps will be at the `root` while workspace specific deps will be installed in the appropriate workspace. Yarn workspaces paired with [nx](https://nx.dev/) is a killer combo
- `yarn build` - Build the app, the correct ordering is set in the `nx.json` file for dependencies across packages like shared types

- `yarn dev` - Start the app

- `yarn pretty` & `yarn pretty:fix` - Run prettier & fix any issues

- `yarn lint` & `yarn lint:fix` - Run the linter & fix any issues

- `yarn tidy` - Runs prettier and fix sequentially
<!-- cspell:disable-next-line -->
- `yarn spellcheck` - Mkae srue you didn't goof up a wrod

## Environment variables

> Check the .env.sample in each package for guidance

In **packages/env**, there is an `env.ts` file which has **ALL** of the environment variables for the app. When running locally, each package reads from their local `.env` file and parses it with `zod` in each package's respective `env.ts` where we `.pick()` the variables that we need from the main schema.

When deploying, the `infra` package has all of the environment variables and passes them to the container and into the NextJS app via the `NEXT_PUBLIC_` naming convention where needed.

To add an environment variable:

1. Add it to the `env.ts` file in the **packages/env**
2. `pick()` the environment variable in the specific package it is being used in so it gets parsed by zod
3. Add it to the `.env` file so you can test the app locally

## Language, Tooling, & Infrastructure

> Make sure to open the `plutomi.code-workspace` file to get the best dev experience with linters and such

Typescript all the things. Infrastructure is managed by CDK aside from the DB. The frontend is [NextJS](https://nextjs.org/) and we have an [Express](https://expressjs.com/) app serving it from [AWS Fargate](https://aws.amazon.com/fargate/).

#### MongoDB

We are using Mongo on [Atlas](https://www.mongodb.com/atlas/database) due to DynamoDB no longer meeting our needs. We store everything in one collection ([yes, really](https://youtu.be/eEENrNKxCdw?t=960)). It works great. No ORM as they aren't really designed for the way we are using it and it was hard trying to shoehorn this pattern in.

## Questions?

Open an issue! Or [DM me on Twitter](https://twitter.com/notjoswayski) or email jose@plutomi.com

## License

This project is licensed under the [Apache 2.0 license](LICENSE). Here is a [TLDR](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).

## Contributing & Contributors ✨

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/joswayski"><img src="https://avatars.githubusercontent.com/u/22891173?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=joswayski" title="Code">💻</a> <a href="#infra-joswayski" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-joswayski" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/praguru14"><img src="https://avatars.githubusercontent.com/u/48213609?v=4?s=100" width="100px;" alt=""/><br /><sub><b>praguru14</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=praguru14" title="Code">💻</a> <a href="#maintenance-praguru14" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/mazupicua"><img src="https://avatars.githubusercontent.com/u/37680756?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=mazupicua" title="Code">💻</a> <a href="#maintenance-mazupicua" title="Maintenance">🚧</a> <a href="https://github.com/plutomi/plutomi/issues?q=author%3Amazupicua" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Jeremyjay121"><img src="https://avatars.githubusercontent.com/u/94778748?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeremy Trenchard</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=Jeremyjay121" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
