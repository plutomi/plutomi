## Intentionally left blank
# Check providers.tf to add a new provider,
# or provider-name.tf for that provider's configuration.
terraform {
  required_version = ">= 1.2.0"


  backend "s3" {
    # Bucket name is set in the *environment*.tfbackend file

    key            = "terraform/terraform.tfstate"  
    region         = "us-east-1"
    encrypt        = true
    # Optional for state locking
    dynamodb_table = "terraform-lock-table"  
  }
}


