# ### Creates two datasets and two tokens for Axiom - a 'development' and 'production' pair
# ## ! This provider has a lot of issues :(
# resource "axiom_dataset" "development" {
#     name = "development"
#     description = "This dataset is used for development purposes ONLY."
# }


# resource "axiom_dataset" "production" {
#     name = "production"
#     description = "This dataset is used for production purposes ONLY."
# }


# resource "axiom_token" "development_token" {
#   name = "Development API Token"
#   description = "This token is used for development purposes ONLY."
#   dataset_capabilities = {
#     "development" = {
#         ingest          = ["create"]
#         query           = ["read"]
#     }
#     }
# }

# resource "axiom_token" "production_token" {
#   name = "Production API Token"
#   description = "This token is used for production_token purposes ONLY."
#   dataset_capabilities = {
#     "production" = {
#         ingest          = ["create"]
#         query           = ["read"]
#     }
#     }
# }
