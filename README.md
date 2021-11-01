# Plutomi

### [Website](https://plutomi.com)

**Plutomi is an applicant tracking system**.

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

## Architecture

**All infastructure will be managed by AWS CDK.**

We believe CDK to be the future and it's nice to have 'first-class' tooling directly from AWS.

Some useful repos:

- [AWS ECS Patterns](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-ecs-patterns)
- [Serverless CDK Patterns](https://github.com/cdk-patterns/serverless)

The frontend is deployed with the [Serverless-Nextjs component](https://github.com/serverless-nextjs/serverless-next.js). It's your typical S3 + Cloudfront setup for a React app but leverages Lambda@Edge for Next's file based routing. It also uses Lambda@Edge for API routes but there are several downsides to this listed [here](https://github.com/plutomi/plutomi/issues/172), so we will not be using them.
Eventually, we will move the frontend to CDK with the [CDK construct](https://serverless-nextjs.com/docs/cdkconstruct/).

The API is built with CDK and runs on AWS Fargate.

> Why not API Gateway + regular Lambda?

The choice ultimately came down to local development / testing.
We would prefer to have one tool to do all infastructure (CDK). The only real way to test lambda functions locally is to use [AWS SAM with CDK](https://aws.amazon.com/blogs/compute/better-together-aws-sam-and-aws-cdk/) which just seems like a hack :/. This would also require running two local dev servers: one for Nextjs & one for the lambdas with SAM.
With CDK, we can run Nextjs in Docker and use the native Nextjs dev environment, tooling, & file based routing and not have to change anything. [This comment](https://news.ycombinator.com/item?id=28841292) on Hacker News also adds some insight. We will still use lambdas for background jobs such as queues, DynamoDB streams, email sending, etc. If things do change and the local lambda development becomes easier (with CDK), we wouldn't mind switching back.

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
