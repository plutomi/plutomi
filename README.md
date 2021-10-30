# Plutomi - [Website](https://plutomi.com)

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

## Motivation

We were not satisfied with the current landscape of applicant tracking systems, especially for large scale, high volume hiring. It would have benefited us to have an open source platform that we could contribute to and make changes ourselves instead of waiting for the vendor to (maybe) implement changes many months down the line.

This project is our attempt to address some of the issues we encountered and to provide a platform for others to improve upon.

## Architecture

At the time of this writing, this project uses the [Serverless-Nextjs component](https://github.com/serverless-nextjs/serverless-next.js). All pages are rendered using SSG and data fetching is done client side. I am in the process of migrating the backend from Lambda@Edge to a regular APIGW/Lambda setup using the AWS CDK. Some of the reasons for migrating off of Edge are listed [here](https://github.com/plutomi/plutomi/issues/172). Once this migration is finished, the API will be completely separate from the front end at `api.plutomi.com` (_which means regular NextJS API routes will not work!_).

Each function will be responsible for ONE (1) thing (no monolambda / lambda per service). However, lambdas that have common paths will be grouped together in each stack. As an example, the routes that deal with `authentication` (creating login links, logging in, & logging out) will be a single stack with a total of three functions.

In the future, I also plan to move the front end to CDK using the [CDK construct](https://serverless-nextjs.com/docs/cdkconstruct/) for the Serverless Nextjs component. This would allow just one tool to build and deploy all infastructure.

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
