### Prerequisites

Most of the Plutomi infrastructure is managed by Terraform. This creates a catch-22 situation where you need to create a few things by hand before you can deploy the application. We do not use Terraform Cloud, instead we manage our own Terraform state [using S3 and DynamoDB](https://developer.hashicorp.com/terraform/language/backend/s3). It is highly recommended to create a top level `shared` account for these resources, and it is assumed that you have a multi account setup on AWS, one for each environment such as `plutomi-development`, `plutomi-staging`, and `plutomi-production`. We will create a role in the `plutomi-shared` account that can be assumed by the other accounts for managing the Terraform state.

The recommended resources for deploying Plutomi are 3 x86 nodes with at least 2vCPU, 8GB RAM, and 100GB SSD each.

The deployment will create the following: # TODo update with nodtes from PR

- SES identity for sending emails
- SNS topic and SQS as a destination for emails
- The DNS records that SES requires (DKIM, SPF) on Cloudflare
- R2 storage bucket for application assets
- 3 EC2 instances to run our workload

# TODO - create Cloudflare R2 keys and add to secrets

- Two datasets and two API keys on Axiom for logging
- An ECR repository for storing Docker images _for each service_
- A [Secrets Manager](https://aws.amazon.com/secrets-manager/) secret with the application's secrets
- In your plutomi-_environment_ account, a user with access to the ECR repository(TODO) to pull images on startup, access other AWS services like SQS and SES, and access the Secrets Manager secret for other credentials like the aforementioned Axiom API keys or R2 bucket keys

```bash
# Login to AWS
# Make sure this profile is used in the main.tf file
aws sso login --profile plutomi-shared
export AWS_PROFILE=plutomi-shared

# Create the S3 Bucket
# Make sure the name matches what is in main.tf
aws s3api create-bucket \
    --bucket plutomi-terraform-config \
    --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
    --bucket plutomi-terraform-config \
    --versioning-configuration Status=Enabled

# Create the DynamoDB Table
# Make sure the name matches what is in main.tf
aws dynamodb create-table \
    --table-name terraform-lock-table \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

Once you've created a bucket and a table in the shared account, you need to create a policy that allows taking actions on these resources:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "dynamodb:PutItem",
        "dynamodb:DescribeTable",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:SHARED_ACCOUNT_ID:table/terraform-lock-table",
        "arn:aws:s3:::plutomi-terraform-config/*",
        "arn:aws:s3:::plutomi-terraform-config"
      ]
    }
  ]
}
```

Then, create a role that allows assuming this policy from the `developer` / `staging`/ `production` accounts:

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::DEV_ACCOUNT_ID:root",
                    "arn:aws:iam::STAGING_ACCOUNT_ID:root",
                    "arn:aws:iam::PROD_ACCOUNT_ID:root"
                ]
            },
            "Action": "sts:AssumeRole",
            "Condition": {}
        }
    ]
}
```

Then, `cd` into the `/terraform` directory and initialize it. You can do this from the other accounts:

```bash
cd terraform
terraform init
```

Then, create a new workspace for the environment you want to deploy to:

```bash
terraform workspace new plutomi-development
```

Create a `secrets.tfvars` file with the content from [secrets.example.tfvars](terraform/secrets.example.tfvars) and update the values as needed:

```bash
cp secrets.example.tfvars secrets.tfvars
```

Then, check the plan:

```bash
terraform plan -var-file=secrets.tfvars
```

If everything looks good, apply the changes:

```bash
terraform apply -var-file=secrets.tfvars
```

Get your SSH key for the EC2 instances, you'll need it in a bit:

```bash
terraform output -raw plutomi-development-ssh-key > plutomi-development-ssh-key.pem
```

### Building the Docker images

In the previous step, we created a new ECR repository for each service. Now, we need to build the Docker images and push them to ECR. There's a script to help you out, just tell it what service you want to build and with which account and it will push to ECR for you. You can do this by running the following command:

```bash
# Make sure you run this from the root of the repository
./scripts/docker.sh api plutomi-development
```

# TODO set this in k8s somehow :T

> The template/deployment.yaml file pulls this in for you

### Note about how third party credentials should be stored in Secrets Manager, generic config like environment or svc.local urls can be in shared values file

### TODO move cloudlare token to here

```bash
kubectl create secret generic cloudflare-token --dry-run=client --from-literal=CLOUDFLARE_DNS_TOKEN=TOKEN_HERE -n cert-manager -o yaml | kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --format yaml > ./k8s/secrets/cloudflare.yaml
```

---

## Deploying to other environments

From here on out, each deploy will use the secrets variables and the appropriate aws profile.

Repeat the following steps for each environment:

1. Create a new workspace for the environment

```bash
terraform workspace new plutomi-staging
```

2. Create a `secrets-ENVIRONMENT.tfvars` file with the appropriate **overridden** values
3. Check the plan and apply as needed

```bash
# Check the plan
terraform plan -var-file=secrets.tfvars -var-file=secrets-ENVIRONMENT.tfvars

# Apply the changes
terraform apply -var-file=secrets.tfvars -var-file=secrets-ENVIRONMENT.tfvars
```

You should now see multiple state files in your S3 bucket, one for each environment:

![state](/images/state.png)

---

## TODO note about

For multi platform builds, you only have to do this once:
docker buildx create --name multiarch --use --bootstrap

Build the image and push it to the repository. This might take a while depending if cross compiling.
docker buildx build --platform linux/amd64 -t plutomi/<api|web|consumer> . --push
