# Plutomi

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/github/license/plutomi/plutomi?style=flat-square)](#)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-blue.svg?style=flat-square)](#contributors-)

> ⚠️ ⛔ _WARNING_ ⛔ ⚠️
>
> _This project is **NOT** production ready and can change at any time. You **WILL** lose your data_ :)

### [Website / Live Demo](https://plutomi.com)

Plutomi is an [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at _any_ scale.

## Motivation

Having worked at a company that needed to recruit thousands of contractors every month, improving our acquisition flow at that scale became a challenge. Many processes had to be done manually because there just wasn't an API available for it. We often hit limits and had to work around them with a myriad of webhooks, queues, and batch jobs to keep things running smoothly. It would have benefited us to have an open platform to contribute to and build upon, as well as one where we didn't have to continuously tip toe around performance limits. This project is our attempt to do just that.

## Summary

In your recruiting flow, you can create `openings`, which people can apply to. An opening can be anything from a job, a location for a delivery company, or a program like a summer camp.

In these openings, you can create `stages` which are individual steps for your application. You can add questions which applicants can answer, and setup automatic move rules that determine where applicants go next depending on their answers or after a certain time period.

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
- Create a [Hosted Zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html) in Route53 with your domain
- Create a [verified identity](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-domain-procedure.html) with your domain in SES
- Create a [certificate for your domain](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html#request-public-console) in AWS Certificate Manager

> :point_up: Will try to add the Route53 / ACM / SES setup to CDK eventually [#390](https://github.com/plutomi/plutomi/issues/390)

## Useful commands

| Command      | Function                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| npm run dev  | Will start the NextJS frontend on port `3000` and the Express API on port `4000` |
| npm run next | Will start NextJS only                                                           |
| npm run api  | Will start the API only                                                          |
| cdk deploy   | Will deploy the specified stack(s)                                               |
| cdk destroy  | Will destroy the specified stack(s)                                              |
| cdk synth    | Emits the synthesized CloudFormation template for the stack(s)                   |

For more information on AWS CDK, please visit the [docs page](https://docs.aws.amazon.com/cdk/latest/guide/cli.html).

## Language & Tooling

The project is 100% TypeScript. Would appreciate any assistance on types as we're definitely not the best :sweat_smile:

Docker is used to run our Express API on Fargate.

_ALL_ infrastructure is managed by AWS CDK.

## Infrastructure

![frontend](infra/Frontend.png)

The frontend runs on the [CDK construct](https://serverless-nextjs.com/docs/cdkconstruct/) of the [Serverless-Nextjs](https://github.com/serverless-Nextjs/serverless-next.js) component. The reason being is we wanted everything managed by CDK and this provides an awesome way to do just that. The SLS component brings with it the Next API routes using Lambda but there are a couple of downsides (some of them are listed [here](https://github.com/plutomi/plutomi/issues/172)) and we won't be using them.

![backend](infra/Backend.png)

Typical 'monolith' express app on an autoscaling Fargate cluster.

We considered API Gateway + Lambda but we kept running into quirks that essentially wipe out all of the gains from "only focusing on business logic". Here is an example of a fun (4 year old) bug: [Unable to change parameter names in API Gateway without tearing the route down and redeploying](https://github.com/serverless/serverless/issues/3785)! Another main complaint is local development, or lack there of. Or cold starts no matter how infrequent they might be. Or performance (we were getting consistently faster response times like in [this test by the folks at Trek10](https://www.trek10.com/blog/fargate-vs-lambda)). Or cost at high throughput.. mainly API Gateway :sweat_smile:

To be clear, we will still use lambda for background tasks such as queues, DynamoDB streams, email sending, etc. just not for the main API of the site. Fargate gives us the best of both worlds, and we're very happy with it!

## DynamoDB Schema

> Schema is subject to change but I will try to keep this updated as much as I can

We're using a single table design for this project. If you're new to Dynamo, I recommend watching these talks by Alex DeBrie and Rick Houlihan first:

- Alex DeBrie @ re:Invent 2020 - [Data modeling with Amazon DynamoDB – Part 1](https://www.youtube.com/watch?v=fiP2e-g-r4g)
- Alex DeBrie @ re:Invent 2020 -[ Data modeling with Amazon DynamoDB – Part 2](https://www.youtube.com/watch?v=0uLF1tjI_BI)

- Rick Houlihan @ re:invent 2018 - [Advanced Design Patterns for DynamoDB (DAT401)](https://www.youtube.com/watch?v=HaEPXoXVf2k)
- Rick Houlihan @ re:invent 2019 - [Advanced design patterns for DynamoDB (DAT403-R1)](https://www.youtube.com/watch?v=6yqfmXiZTlM)

Also, don't forget to buy **THE** [DynamoDB Book](https://www.dynamodbbook.com/) by Alex ;)

To play around with the data model locally, you can download [NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html) and import the [NoSQLWorkbench.json](Schema/NoSQLWorkbench.json) file into it. You can even export the table to your AWS account and generate queries in Python, JavaScript, or Java.

I've created [a spreadsheet](https://docs.google.com/spreadsheets/d/1KZMJt0X2J0s1v8_jz6JC7aiiwYW8qVV9pKWobQ5012Y/edit?usp=sharing) with access patterns and use cases if you prefer that. It helps to follow along with NoSQL Workbench on your own machine or you can view the pictures in the [Schema](./Schema) folder.

You might have noticed that _some_(!) sort keys (SK, GSI1SK, GSI2SK) have the `ENTITY_TYPE` prefixed (e.g. `APPLICANT_FILE`). This is intentional and it's to retrieve these child items when doing a query on the parent.
For example, if we want to retrieve an applicant, we might also want to retrieve their files, notes, and responses. We can do that with a single query: `PK = APPLICANT#{APPLICANT ID} and SK begins_with(APPLICANT)` :)

Some partitions will [need to be sharded](https://youtu.be/6yqfmXiZTlM?t=884) in the future, especially for high RCU queries at scale (get all applicants in an org, in a stage, in an opening, all webhook history, etc.). I am not going to bother with this for now but it _is_ on my radar! You can read more about good partition keys [here](https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/).

Another thing to note is that Dynamo has a 400kb limit per item. This means that we do have to set _some_ limits, specifically around entities that can have their order re-arranged (`MAX_CHILD_ENTITY_LIMIT`). The limit is on the _parent_ entity, not the re-arrangeable entity itself. Things like stages in an opening or questions & rules in a stage are affected since we have to store their order in their parent item. In practice, even at millions of applicants, it is very unlikely to have hundreds of these entities under one parent.

## Other useful repos:

- [AWS ECS Patterns](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-ecs-patterns)
- [Serverless CDK Patterns](https://github.com/cdk-patterns/serverless)

## Common errors

> Argument of type 'this' is not assignable to parameter of type 'Construct'

Make sure all of your `@aws-cdk/*` dependencies are running the same version + make sure whatever you are using in the construct is actually being imported at the top of the file

> ERROR [internal] load metadata for public.ecr.aws/sam/build-nodejs

Try running this command: `aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/sam/build-nodejs`

## Contributing

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

This project tries to follow Semantic Pull Requests some what.
Your PR _title_ should have the following format:

| Type                  | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| feat: OR enhancement: | Added a new feature or enhancement                                                             |
| fix:                  | Squashed some bugs!                                                                            |
| docs:                 | Updated documentation, readme, examples                                                        |
| test:                 | Added / modified tests                                                                         |
| chore:                | Maintenance, cleanup, comment removal, refactoring, etc. If it doesn't fit above, it goes here |

Example: _fix: Removed the double modals popping up on login_

## License

This project is licensed under the `GNU AGPLv3` license. It can be viewed [here](https://choosealicense.com/licenses/agpl-3.0/) or in the [LICENSE.md](LICENSE.md) file.

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
    <td align="center"><a href="https://github.com/mazupicua"><img src="https://avatars.githubusercontent.com/u/37680756?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jose Valerio</b></sub></a><br /><a href="https://github.com/plutomi/plutomi/commits?author=mazupicua" title="Code">💻</a> <a href="#maintenance-mazupicua" title="Maintenance">🚧</a> <a href="https://github.com/plutomi/plutomi/issues?q=author%3Amazupicua" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
