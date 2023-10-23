# Various scripts for running and deploying Plutomi

## Running

To run locally, you can run:

```bash
$ scripts/run/dev.sh
```

Which will start the API and the frontend in development mode. You can run either individually with `api.sh` and `web.sh` respectively. The API will need to be restarted if you make changes to the code, but the frontend will automatically reload.

## Deploying

As shown in the [root README](../README.md), the frontend is a NextJS app on [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/) and the API is a Rust + Axum container on [Fly.io](https://fly.io/docs/speedrun/). To deploy either, you can run:

```bash
$ scripts/deploy/web.sh
$ scripts/deploy/api.sh
```

For the API, if you do not specify a deployment environment, it will default to `staging`. For the frontend, Cloudflare automatically deploys to staging environments (called "preview environments") for every pull request & commit not on the `main` branch. To force a deploy to production, you can run:

```bash
$ scripts/deploy/web.sh production
```

This will pass `--branch=main` to the deploy script. Ensure that `main` is set for your production environment on Cloudflare and everything should work.

### AWS

To deploy to AWS, make sure you have [configured SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) correctly. Update the `AWS_PROFILE` variable in [scripts/deploy/aws.sh](deploy/aws.sh) to match the profile names you want to use. Update the domains you want to use in [setupSES.ts](../packages/aws/lib/setupSES.ts) and then run:

```bash
$ scripts/deploy/aws.sh
```

This will setup most of your AWS environment. For SES, you'll need to add a few records to your DNS provider. Your SES dashboard should look something like this with the records you need to add:

![SES DNS Records](../images//ses-setup.png)

## Adding more scripts

If you add another script, you might run into a permission issue:

```bash
permission denied: scripts/run/example.sh
```

To fix this, you can run:

```bash
$ chmod +x scripts/run/example.sh
```

Or for the whole directory:

```bash
$ chmod +x scripts/run/*
```
