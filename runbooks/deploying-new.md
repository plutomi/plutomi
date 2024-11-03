### Prerequisites

Most of the Plutomi infrastructure is managed by Terraform. This creates a catch-22 situation where you need to create a few things by hand before you can deploy the application, like an S3 bucket to store the Terraform state files per environment and a DynamoDB table for locking the state file. It is highly recommended to create a top level `shared` account for these resources, and it is assumed that you have a multi account setup on AWS, one for each environment such as `plutomi-development`, `plutomi-staging`, and `plutomi-production`. We will create a role in the `plutomi-shared` account that can be assumed by the other accounts for managing the Terraform state.

The deployment will create the following:

- SES identity for sending emails
- SNS topic and SQS as a destination for emails
- The DNS records that SES requires (DKIM, SPF) on Cloudflare
- R2 storage bucket for application assets

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

Once you've created a bucket and a table in the shared account, you need to create a policy that allows actions on S3 and DynamoDB -> https://developer.hashicorp.com/terraform/language/backend/s3

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

Then, create a role that allows assuming this policy from the sub accounts:

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

Then, cd into terraform and initialize it. You can do this from the other accounts:

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

## Deploy to other environments

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
