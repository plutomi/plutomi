### Prerequisites

You need to create a few things by hand before you can deploy the application, like a storage bucket to store the Terraform state file(s) per environment. You want to enable bucket on this bucket and block all public access. Then, you'll want to create a DynamoDB table for locking the state file.

```bash
# Login to AWS
aws sso login --profile plutomi-development
export AWS_PROFILE=plutomi-development

# Create the S3 Bucket
# Make sure this matches the terraform/*environment*.tfbackend file(s)
aws s3api create-bucket \
    --bucket plutomi-development-terraform \
    --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
    --bucket plutomi-development-terraform \
    --versioning-configuration Status=Enabled

# Create the DynamoDB Table
aws dynamodb create-table \
    --table-name terraform-lock-table \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

```

Once you've created the bucket and DynamoDB table, cd into terraform and initialize it:

```bash
cd terraform

terraform init -backend-config=development.tfbackend -reconfigure
```

Then, create a new workspace for the environment you want to deploy to:

```bash
terraform workspace new development
```

Create a `secrets.tfvars` file in the [terraform](terraform) directory with the content from [secrets.example.tfvars](terraform/secrets.example.tfvars) and fill in the values.

Then, check the plan:

```bash
terraform plan -var-file=secrets.tfvars -out=plantest
```

If everything looks good, apply the changes:

```bash
terraform apply -var-file=secrets.tfvars
```

Repeat the steps above for each environment:

1. Create the S3 bucket and DynamoDB table manually
2. Initialize Terraform with the appropriate backend configuration (`ENVIRONMENT.tfbackend`)
3. Create a new workspace for the environment
4. Create a `secrets-ENVIRONMENT.tfvars` file with the appropriate **override** values
5. Check the plan and apply as needed
   > terraform plan -var-file=secrets.tfvars -var-file=secrets-ENVIRONMENT.tfvars

```bash
export AWS_PROFILE=plutomi-staging
```

```bash
terraform init -backend-config=staging.tfbackend -reconfigure
```
