# Check providers.tf to add a new provider,
# or provider-name.tf for that provider's configuration.
terraform {
  required_version = ">= 1.2.0"

  # We are using a remote backend to store the state file
  # Check DEPLOYING.md for more information on how to set this up
  backend "s3" {
    bucket         = "plutomi-terraform-config"
    key            = "terraform/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock-table"
    profile        = "plutomi-shared"
  }
}


