# Plutomi

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/github/license/plutomi/plutomi?style=flat-square)](#)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-blue.svg?style=flat-square)](#contributors-)

### [Website / Live Demo](https://plutomi.com)

Plutomi is a *multi-tenant* [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](images/infra.png)

## Motivation

Having worked at a company that needed to recruit thousands of contractors every month, improving our acquisition flow at that scale became a challenge. Many processes had to be done manually because there just wasn't an API available for it. We often hit limits and had to work around them with a myriad of webhooks, queues, and batch jobs to keep things running smoothly. It would have benefited us to have an open platform to contribute to and build upon and this project is our attempt to do just that.

## Summary

You can create `openings` which people can apply to. An opening can be anything from a job, a location for a delivery company, or a program like a summer camp.

In these openings, you can create `stages` which are individual steps for your application. You can add questions for applicants to answer, and setup automatic move rules that determine where applicants go next depending on their answers or after a certain time period.

An _opening_ for a delivery company might look like this:

Opening name: **New York City**

Stage order:

1. **Questionnaire** - Collect basic information of an applicant. If an applicant does not complete this stage in 30 days, move them to the _Waiting List_.
2. **Waiting List** - An idle pool of applicants
3. **Document Upload** - Collect an applicant's license
4. **Final Review** - Manually review an applicant's license for compliance
5. **Ready to Drive** - Applicants that have completed your application

## Prerequisites

- Install [Docker](https://docs.docker.com/get-docker/)
- Create `.env.development` & `.env.production` files, see the [.env.sample](.env.sample) for the values required
- Create a [Hosted Zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) in Route53 with your domain
- Create a [verified identity](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domain-procedure.html) with your domain in SES
- Create a [certificate for your domain](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html#request-public-console) in AWS Certificate Manager

## Useful commands

| Command                                                                                                 | Function                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm run dev                                                                                             | Will deploy a copy of **most** the backend to AWS (Dynamo, Event Bridge, SQS, Step Functions, etc). The frontend & Express server run in localhost |
| npm run test                                                                                            | Will run tests                                                                                                                                     |
| npm run deploy-prod                                                                                     | Will deploy everything to your production environment                                                                                              |
| npx cross-env NODE_ENV=(development or production) cdk deploy -e (development or production)-STACK_NAME | Will deploy a specific stack in the desired environment                                                                                            |

## Language, Tooling, & Infrastructure

All infrastructure is managed by CDK and we use [Jest](https://jestjs.io/) for testing. Everything is written TypeScript and we would appreciate any assistance on types or tests as we're definitely not the best :sweat_smile:

The frontend is using [NextJS](https://nextjs.org/) and we have an [Express](https://expressjs.com/) app serving it from [AWS Fargate](https://aws.amazon.com/fargate/).

#### DynamoDB

We're using a single table design for this project. If you're new to DynamoDB, I created [a playlist](https://youtube.com/playlist?list=PL4wKJluo18Z2Nh1QlU0LXKy6EbPwB17xq) that will help you get accustomed to it. There are videos from Alex Debrie, Rick Houlihan, Pete Naylor, and an awesome talk by Kai Zhao on adaptive capacity.

There are some asynchronous events that are made possible by the Dynamo streams:

1. _Cascading deletions_ - When deleting an entity that has child items such as an org and its openings or an opening and its stages, the [parent is deleted right away but the children will be deleted asynchronously](images/DeleteChildrenStepFunction.png) with a state machine. At the top of the workflow there is a `choice` state which figures out which entity was deleted. It then retrieves all of the **_top-level_** child items for that entity (deleting an opening only retrieves the stages, but not the applicants in those stages). The state machine maps through each item and deletes them. This causes the state machine to be called again: Dynamo stream -> EventBridge -> StepFunction with the newly deleted entity.

2. _Webhooks_ - Any applicant events (`INSERT`, `MODIFY`, or `DELETE`) trigger another state machine that sends the entire event payload that we received from Dynamo to your configured URL.

We're also using Athena to query Dynamo with plain old SQL using [Federated Queries](https://docs.aws.amazon.com/athena/latest/ug/connect-to-a-data-source.html) - ([video](https://www.youtube.com/watch?v=tZia_5qxPkY)). We haven't figured out how to add a data source using CDK but this is very simple. Once deployed, click [Connect Data Source](https://console.aws.amazon.com/athena/home?region=us-east-1#/data-sources) and select **DynamoDB**. Choose a name and then select the lambda function that is created in the stack: _NODE_ENV_-athena-dynamo-query-function

## Other useful repos:

- [AWS ECS Patterns](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-ecs-patterns)
- [Serverless CDK Patterns](https://github.com/cdk-patterns/serverless)

## Contributing

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

This project tries to follow Semantic Pull Requests some what.
Your PR _title_ should have the following format:

| Type                  | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| feat: OR enhancement: | Added a new feature or enhancement                                   |
| fix:                  | Squashed some bugs!                                                  |
| docs:                 | Updated documentation, readme, examples                              |
| test:                 | Added / modified tests                                               |
| chore:                | Maintenance, refactoring, etc. If it doesn't fit above, it goes here |

Example: _fix: Removed the double modals popping up on login_

## License

This project is licensed under the [Apache 2.0 license](LICENSE)

## Contributors ✨

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
