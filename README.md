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

We believe CDK to be the future and it's nice to have 'first-class' tooling directly from AWS. Therefore,
**all infastructure is managed by CDK**.

The website (at the moment) runs on AWS Fargate. That means frontend and API, all in one big monolith. TIL: Managed NAT Gateways = $$$

We started with the [Serverless-Nextjs](https://github.com/serverless-nextjs/serverless-next.js) component which uses Lambda@Edge for API routes. There are many downsides to Edge functions, some are listed [here](https://github.com/plutomi/plutomi/issues/172).
We're currently migrating everything to run on the [Serverless-Nextjs CDK Construct](https://serverless-nextjs.com/docs/cdkconstruct/) with an API Gateway + Lambda backend.

We are using cookies for auth. TIL: APIGW does not support cookies for custom authorizers!!! ([2016](https://forums.aws.amazon.com/thread.jspa?threadID=229154) & [2020](https://forums.aws.amazon.com/thread.jspa?threadID=321664) feature requests). So we are just wrapping a `withSession` middleware to our routes that require it. Such is life.

Some other useful repos:

- [AWS ECS Patterns](https://github.com/aws/aws-cdk/tree/master/packages/%40aws-cdk/aws-ecs-patterns)
- [Serverless CDK Patterns](https://github.com/cdk-patterns/serverless)

## Useful commands

> NOTE: To deploy, you must first build your docker image and publish to ECR. We will automate this via CI / CD in the future.
>
> `docker build -t <your-username>/<your-app-name> .`
>
> [How to push your image to ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html)

- `npm run dev` run the app locally
- `cdk deploy --all` deploy the backend only, can specify a single stack
- `cdk destroy --all` destroy the entire backend, can specify a single stack
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

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
