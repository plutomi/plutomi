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
  profile = var.aws_profile
  region  = var.aws_region
}

provider "cloudflare" {
  api_token = var.cloudflare_admin_token
}


provider "axiom" {
  api_token = var.axiom_admin_api_token
}
