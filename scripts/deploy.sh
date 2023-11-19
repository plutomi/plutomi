#!/bin/bash

# Function to print error message and usage
print_error_and_exit() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 [--stack <stack>] [--env <environment>]\n"
    echo -e "Stack (optional): --stack=<api,web,aws>"
    echo -e "Environment (optional): --env=<development,staging,production>"
    exit 1
}

# Default values
stack=""
environment="staging" # Default to 'staging' if no environment is provided

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --stack) stack="$2"; shift ;;
        --env) environment="$2"; shift ;;
        *) print_error_and_exit "Invalid argument: $1" ;;
    esac
    shift
done

# Validate environment
[[ "$environment" =~ ^(staging|production|development)$ ]] || print_error_and_exit "Invalid environment: '$environment'. Must be 'staging', 'production', or 'development'."

deploy_all() {
    deploy_aws
    deploy_api
    deploy_web
}

# Function definitions (deploy_api, deploy_web, deploy_aws) remain the same
deploy_api() {
    (
    # Navigate to the API directory and deploy
    cd packages/api
    sed "s/{{ENV}}/$environment/g" fly.template.toml > fly.toml
    fly deploy
    )
}

deploy_web() {
    (
    # Force deploy to Cloudflare main branch
    if [[ "$environment" == "production" ]]; then
        BRANCH_ARG="--branch=main"
    fi

    echo "Deploying WEB (Cloudflare) with environment: $environment and branch: $BRANCH_ARG"

    
    # Navigate to the web directory and deploy
    cd packages/web
    npm run pages:deploy -- $BRANCH_ARG
    )
}

deploy_aws() {
   ( 
    # Set AWS_PROFILE based on the environment
    if [[ "$environment" == "production" ]]; then
        AWS_PROFILE="plutomi-prod"
    elif [[ "$environment" == "staging" ]]; then
        AWS_PROFILE="plutomi-stage"
    elif [[ "$environment" == "development" ]]; then
        AWS_PROFILE="plutomi-dev"
    else
        print_error_and_exit "Invalid environment for AWS deployment."
    fi

    echo "Deploying AWS with environment: $environment and profile: $AWS_PROFILE"
    
    cd packages/aws
    npm run deploy -- DEPLOYMENT_ENVIRONMENT=$environment --profile $AWS_PROFILE
    )
}


# Main deployment logic
if [ -z "$stack" ]; then
    # Deploy all stacks if no specific stack is provided
    deploy_all
else
    # Validate stack
    [[ "$stack" =~ ^(api|web|aws)$ ]] || print_error_and_exit "Invalid stack: $stack. Must be 'web', 'api', or 'aws'."
    [ "$environment" == "development" -a "$stack" != "aws" ] && print_error_and_exit "There is no 'dev' environment for '$stack', run things locally :D"

    # Deploy specific stack
    case "$stack" in
        "api") deploy_api ;;
        "web") deploy_web ;;
        "aws") deploy_aws ;;
        *) print_error_and_exit "Invalid stack specified. Use 'api', 'web', or 'aws'." ;;
    esac
fi
