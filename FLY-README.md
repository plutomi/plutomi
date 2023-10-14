#### Deployment

Plutomi's API is a container that you can run anywhere. We chose fly.io for a variety of reasons. Our CDN / DNS / WAF is Cloudflare for a variety of reasons. We'll use AWS things in the future eventually but deploying this shouldn't be difficult and you can use your own provider(s) if needed.

You can view how to deploy to fly.io here: https://fly.io/docs/speedrun/

TLDR:

- `fly launch`
- `fly deploy --vm-cpu-kind shared --vm-cpus 1 --vm-memory 512`

#### Custom domains

`flyctl certs create -a APP_NAME domain`

- Add the `A` and `AAAA` records to your DNS provider

See `fly.toml` for more config details.
