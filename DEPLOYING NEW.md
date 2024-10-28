### Prerequisites

You need to create a few things by hand before you can deploy the application, like a storage bucket to store the Terraform state file(s) per environment. You want to enable bucket on this bucket and block all public access. Then, you'll want to create a DynamoDB table for locking the state file.

```bash
# Login to AWS
aws sso login --profile plutomi-development

# Create the S3 Bucket
aws s3api create-bucket \
    # Make sure this matches the terraform/*environment*.tfbackend file(s)
    --bucket plutomi-development-terraform-state \
    --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
    --bucket plutomi-development-terraform-state \
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

terraform init
```

Then, create a new workspace for the environment you want to deploy to:

```bash
terraform workspace new development|staging|production
```

Create a `secrets.tfvars` file in the [terraform](terraform) directory with the content from [terraform/secrets.tfvars.example](terraform/secrets.example.tfvars) and fill in the values.

Then, check the plan:

```bash
terraform plan -backend-config="development.tfbackend" -var-file=secrets.tfvars
```

If everything looks good, apply the changes:

```bash
terraform apply -backend-config="development.tfbackend"  -var-file=secrets.tfvars
```
