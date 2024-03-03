# Deploying

To deploy to AWS, make sure you have [configured SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) correctly. Update the `AWS_PROFILE` variable in [deploy.sh](deploy.sh) to match the profile names you want to use. Update the subdomain you want to use for sending emails in [configureSES.ts](./packages/aws/lib/configureSES.ts).

Change directories into `packages/aws`, install dependencies, and set up the environment-specific `.env` files and modify the values as needed.

```bash
$ cd packages/aws
$ npm install
$ cp .env.example .env.development
$ cp .env.example .env.staging
$ cp .env.example .env.production
```

Once that's done, you can go back to the root and deploy using `scripts/deploy.sh <development|staging|production>`.

After running the deploy script, most of your environment will be setup but you'll need to add a few records to your DNS provider. For a custom domain on the load balancer, make sure to [validate your ACM certificate](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html). For SES, your dashboard should look something like this with the records you need to add:

![SES DNS Records](./images/ses-setup.png)

At the end of it you should have (for each environment)

3 DNS records for DKIM

> Key: XXXXXXXXXXXXX Value: XXXXXXXXXXXXX

1 MX Record for custom mail from

> Key: notifications.plutomi.com Value: feedback-smtp.us-east-1.amazonses.com Priority: 10

1 TXT Record for SPF

> Key notifications.plutomi.com "v=spf1 include:amazonses.com ~all"

1 TXT Record for DMARC:
Also, make sure to setup DMARC. This is a TXT record with the name `_dmarc.yourMAILFROMdomain.com` and value `v=DMARC1; p=none; rua=mailto:you@adomainwhereyoucanreceiveemails.com`
See [this link](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html) for more information.

Then after all of that is done, make sure to beg aws to get you out of sandbox since you now have a way to handle complaints.

## AWS

## VPS

Transfer main files to your VPS

```bash
rsync -avz --progress .env  docker-compose.yml nginx.conf username@your-server-ip:plutomi
```

Then ssh into your VPS and you'll want to install docker, docker-compose, and pull the images

```bash
sudo apt-get update -y && sudo apt-get install docker.io -y && sudo systemctl start docker && sudo systemctl enable docker && sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose && cd plutomi && sudo docker-compose pull
```

Then run `docker-compose up -d` to start the services. That's it!
