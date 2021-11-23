# Plutomi

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/github/license/plutomi/plutomi?style=flat-square)](#)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-blue.svg?style=flat-square)](#contributors-)

> ⚠️ _WARNING_ ⚠️
>
> _This project is **NOT** production ready and can change at any time. You **WILL** lose your data_ :)

### [Website / Live Demo](https://plutomi.com)

Plutomi is an [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system).

You can create `openings`, which people can apply to. An opening can be anything from a job, a location for a delivery company, or a program like a summer camp.

In these openings, you can create `stages` which are individual steps for your application. You can add questions which applicants can answer, and setup automatic move rules that determine where applicants go next depending on their answers or after a certain time period.

An _opening_ for a delivery company might look like this:

Opening name: **New York City**

Stage order:

1. **Questionnaire** - Collect basic information of an applicant. If an applicant does not complete this stage in 30 days, move them to the _Waiting List_.
2. **Waiting List** - An idle pool of applicants
3. **Document Upload** - Collect an applicant's license
4. **Final Review** - Manually review an applicant's license for compliance
5. **Ready to Drive** - Applicants that have completed your application

## Language & Tooling

The project is 100% TypeScript. Would appreciate any assistance on types as we're definitely not the best :sweat_smile:

We believe CDK to be the future and it's nice to have 'first-class' tooling directly from AWS. Therefore,
**all architecture is managed by CDK**.

We use Docker to containerize our Nextjs app to be run on AWS Fargate.

## Architecture

![infra](images/infra.png)

We _started_ with the [Serverless-Nextjs](https://github.com/serverless-Nextjs/serverless-next.js) component which uses Lambda@Edge for API routes. There are many downsides to Edge functions, some are listed [here](https://github.com/plutomi/plutomi/issues/172). We've since moved on to hosting entirely on AWS Fargate.

As much as we love "serverless" (API Gateway + Lambda), we keep running into quirks that essentially wipe out all of the gains from "only focusing on business logic". A main complaint is local development. The only real way to test lambda functions locally is to use [AWS SAM with CDK](https://aws.amazon.com/blogs/compute/better-together-aws-sam-and-aws-cdk/) which just seems like a hack :/.
With CDK, we can run Nextjs in Docker and use the native Nextjs dev environment, tooling, & file based routing and not have to change anything. [This comment](https://news.ycombinator.com/item?id=28841292) on Hacker News also adds some insight.

Here is an example of a fun (4 year old) bug: [Unable to change parameter name in API Gateway without tearing it all down and rebuilding](https://github.com/serverless/serverless/issues/3785)! Because why would you ever need to do that?

Or [cold starts](https://filia-aleks.medium.com/aws-lambda-battle-2021-performance-comparison-for-all-languages-c1b441005fd1) / [performance](https://www.trek10.com/blog/fargate-vs-lambda) / cost (either way you slice this one: pure throughput or just Denial of Wallet attacks). To be clear, we will still use lambda for background tasks such as queues, DynamoDB streams, email sending, etc. just not for the main API of the site.

## Useful commands

- `npm run dev` run the app locally
- `npm run deploy` deploy the site - _Docker image is built and deployed by CDK automatically!_
- `npm run destroy` destroy the site
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

And other useful repos:

- [AWS ECS Patterns](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-ecs-patterns)
- [Serverless CDK Patterns](https://github.com/cdk-patterns/serverless)

## License and Open Source

**We are committed to keeping this project open source.**

It is our belief that transparency and direct input into the development process will bring the most benefit to our users in the long run. This project is licensed under the `GNU AGPLv3` license. It can be viewed [here](https://choosealicense.com/licenses/agpl-3.0/) or in the [LICENSE.md](LICENSE.md) file. The reason(s) for this license can be eloquently described by the makers of Plausible.io in [this](https://plausible.io/blog/open-source-licenses) blog post.

## Contributing

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

Your PR _title_ should have the format `type:` whatever-you-worked-on.

Your `type` can be any of the following:

| Type   | Description                                                                 |
| ------ | --------------------------------------------------------------------------- |
| feat:  | Added a new feature or enhancement                                          |
| fix:   | Squashed some bugs!                                                         |
| chore: | Maintenance, tests, refactoring, etc. If it doesn't fit above, it goes here |

Example: `fix: Removed the double modals popping up on login`

---

For any questions, please submit an issue or email contact@plutomi.com!

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/joswayski"><img src="https://avatars.githubusercontent.com/u/22891173?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=joswayski" title="Code">💻</a> <a href="#infra-joswayski" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-joswayski" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/praguru14"><img src="https://avatars.githubusercontent.com/u/48213609?v=4?s=100" width="100px;" alt=""/><br /><sub><b>praguru14</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=praguru14" title="Code">💻</a> <a href="#maintenance-praguru14" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
