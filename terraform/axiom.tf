### Creates two datasets and two tokens for Axiom - a 'development' and 'production' pair
resource "axiom_dataset" "development" {
  # Don't redeploy on staging / production
  count       = var.environment == "development" ? 1 : 0
  name        = "development"
  description = "This dataset is used for development purposes ONLY."
}


resource "axiom_dataset" "production" {
  # Don't redeploy on staging / production
  count       = var.environment == "development" ? 1 : 0
  name        = "production"
  description = "This dataset is used for production purposes ONLY."
}


resource "axiom_token" "development_token" {
  # Don't redeploy on staging / production
  count       = var.environment == "development" ? 1 : 0
  name        = "Development API Token"
  description = "This token is used for development purposes ONLY."
  dataset_capabilities = {
    "development" = {
      ingest = ["create"]
      query  = ["read"]
    }
  }
}

resource "axiom_token" "production_token" {
  # Don't redeploy on staging / production
  count       = var.environment == "development" ? 1 : 0
  name        = "Production API Token"
  description = "This token is used for production_token purposes ONLY."
  dataset_capabilities = {
    "production" = {
      ingest = ["create"]
      query  = ["read"]
    }
  }
}
