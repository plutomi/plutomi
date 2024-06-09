### SealedSecrets

[SealedSecrets](https://sealed-secrets.netlify.app/)

We are using SealedSecrets to store secrets in our this repo without worrying about them being exposed. The SealedSecrets controller will decrypt the SealedSecrets and create the actual Kubernetes Secret in the cluster.

`global-config-secret` will store variables shared across all services. This includes things like the database connection string, API keys, and other shared secrets.

`cloudflare-token` will store the Cloudflare API token. This is used to manage our DNS records and other Cloudflare services.

`mongodb-init-secret` stores the credentials for booting up MongoDB for the first time. These create root credentials which can then be used to create an admin user, which should then be used to create the rest of the users for our application.
