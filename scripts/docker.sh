#!/bin/bash
# Check if all required arguments are provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <service-name> <aws-profile>"
  echo
  echo "Example: $0 api plutomi-development"
  echo
  echo "You provided:"
  echo 
  echo $0
  exit 1

fi

# TODO consumers

# TODO add this to adding a new service
allowed_services=("api" "web" "migrator")

# Check if the argument is not in the allowed values
if ! [[ " ${allowed_services[@]} " =~ " $1 " ]]; then
  echo "Invalid service: $1"
  echo
  echo "Allowed services are: ${allowed_services[*]}"
  echo
  exit 2
fi

# Assign variables
SERVICE_NAME=$1
AWS_PROFILE=$2
AWS_REGION="us-east-1"
IMAGE_TAG="latest"

# Fetch the ECR repository URL from Terraform output for the specified service
ECR_URL=$(cd ./terraform && terraform output -json ecr_repo_urls | jq -r ".\"$SERVICE_NAME\"")


# Check if the ECR URL was retrieved successfully
if [ -z "$ECR_URL" ] || [ "$ECR_URL" == "null" ]; then
  echo "Error: ECR repository URL for service '$SERVICE_NAME' not found in Terraform output."
  exit 1
fi

# Authenticate Docker to AWS ECR
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_URL

docker buildx use default
docker buildx inspect --bootstrap


# Build the Docker image for the specified service
# https://docs.docker.com/build/metadata/attestations/slsa-provenance/
docker buildx build --platform linux/amd64 --provenance=false -t $ECR_URL:$IMAGE_TAG -f ./services/$SERVICE_NAME/Dockerfile . --push



echo "Docker image for '$SERVICE_NAME' has been successfully pushed to $ECR_URL:$IMAGE_TAG"
