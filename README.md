# Plutomi

Plutomi is a _multi-tenant_ [applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) that streamlines your entire application process with automated workflows at any scale.

![infra](images/infra.png)

## Motivation

Having worked at a company that needed to recruit thousands of contractors every month, improving our acquisition flow at that scale became a challenge. Many processes had to be done manually because there just wasn't an API available for it. We often hit limits and had to work around them with a myriad of webhooks, queues, and batch jobs to keep things running smoothly. It would have benefited us to have an open platform to contribute to and build upon and this project is [my](https://www.linkedin.com/in/joswayski/) attempt to do just that.

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
- [Docker](https://docs.docker.com/get-docker/)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
- [AWS SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

- [SES identity](https://us-east-1.console.aws.amazon.com/ses/home?region=us-east-1#/get-set-up) for sending emails. If you don't want to use SES, we recommend using [Postmark](https://postmarkapp.com/). Our AWS stack sets up SES, an SNS topic for events, a queue, and a lambda function to process those events (opens, clicks, bounces, etc.). You'll need to add the DNS records (DKIM, SPF, DMARC) that SES provides you manually. See the [deploying AWS Section](scripts/README.md#aws) for more information.

- [Rust](https://www.rust-lang.org/tools/install)
- [fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/)

## Useful Scripts

See the [scripts README](scripts/README.md) for more information.

## Database

We are using MongoDB on [Atlas](https://www.mongodb.com/atlas/database) where we store everything in one collection ([yes, really](https://youtu.be/eEENrNKxCdw?t=1190)). We write very small documents and index a `relatedTo` attribute that is shared across all items. For most queries, we can get an item and all of the items it is related to without using `$lookup`. See the example below with an applicant and their notes and files:

```typescript
const applicant = {
  name: "Jose Valerio",
  nickname: "joswayski",
  company: "Plutomi, Inc.",
  relatedTo: [
    {
      id: "applicant_123",
      type: "self", // Every item has a reference to itself
    },
  ],
};

const note = {
  text: "This applicant is great!",
  createdBy: "Random Hiring Manager",
  relatedTo: [
    {
      id: "note_123",
      type: "self", /
    },
    {
      id: "applicant_123", // Reference to the applicant
      type: "note",
    },
  ],
};

const file = {
  name: "resume.pdf",
  url: "https://assets.plutomi.com/resume.pdf",
  relatedTo: [
    {
      id: "file_123",
      type: "file",
    }
    {
      id: "applicant_123", // Reference to the applicant
      type: "file",
    },
  ],
};


const applicantWithNotesAndFiles = db.find({ relatedTo: { $elemMatch: { id: "applicant_123" } } });
const justTheNotesForThisApplicant = db.find({ relatedTo: { $elemMatch: { id: "applicant_123", type: "notes" } } });


```

## License

This project is licensed under the [Apache 2.0 license](LICENSE). Here is a [TLDR](https://www.tldrlegal.com/license/apache-license-2-0-apache-2-0).

## Contributing & Contributors

To make a contribution, submit a pull request into the `main` branch. You will be asked to sign a [Contributor License Agreement](https://en.wikipedia.org/wiki/Contributor_License_Agreement) for your PR. You'll only have to do this once.

Thanks goes to these wonderful people who contributed!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
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

## Questions

Open an issue! Or [DM me on Twitter](https://twitter.com/notjoswayski) or email jose@plutomi.com
