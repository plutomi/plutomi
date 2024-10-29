locals {
  aws_profile = {
    development = "plutomi-development"
    staging     = "plutomi-staging"
    production  = "plutomi-production"
  }
  aws_region = {
    development = "us-east-1"
    staging     = "us-east-1"
    production  = "us-east-1"
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 4"
    }

    axiom = {
      source  = "axiomhq/axiom"
    }

  }

}

provider "aws" {
  profile = locals.aws_profile[var.environment]
  region  = locals.aws_region[var.environment]
}

provider "cloudflare" {
  api_token = var.cloudflare_admin_token
}


provider "axiom" {
  api_token = var.axiom_admin_api_token
}
