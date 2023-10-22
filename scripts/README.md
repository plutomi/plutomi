## Various scripts for running and deploying Plutomi

#### Running

To run locally, you can run::

```bash
$ scripts/run/dev.sh
```

Which will start the API and the frontend in development mode. You can run either individually with `api.sh` and `web.sh` respectively. The API will need to be restarted if you make changes to the code, but the frontend will automatically reload.

#### Deploying

As stated in the [root README](../README.md), the frontend is a NextJS app on [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/) and the API is a Rust + Axum container on [Fly.io](https://fly.io/docs/speedrun/). To deploy the frontend, you can run:

```bash
$ scripts/deploy/web.sh
```

and the API with:

```bash
$ scripts/deploy/api.sh production/staging
```

For the API, if you do not specify a deployment environment, it will default to `staging`. For the frontend, Cloudflare automatically deploys to staging environments (called preview environments) for every pull request & commit not on the `main` branch.
