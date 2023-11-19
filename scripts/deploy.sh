#!/bin/bash

# Function to print error message and usage
print_error_and_exit() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 <component> <environment>\n"
    echo -e "Component: 'api', 'web', or 'aws'\n"
    echo -e "Environment: 'development', 'staging', or 'production'.\n"
    exit 1
}

# Check if two arguments are provided
[ $# -ne 2 ] && print_error_and_exit "Invalid number of arguments"

component=$1
environment=$2

# Validate component and environment
[[ "$component" =~ ^(api|web|aws)$ ]] || print_error_and_exit "Invalid component: $component. Must be 'web', 'api', or 'aws'."
[[ "$environment" =~ ^(staging|production|development)$ ]] || print_error_and_exit "Invalid environment: '$environment'. Must be 'staging', 'production', or 'development'."
[ "$environment" == "development" -a "$component" != "aws" ] && print_error_and_exit "There is no 'dev' environment for '$component', run things locally :D"

deploy_api() {
    # Navigate to the API directory and deploy
    cd packages/api
    sed "s/{{ENV}}/$environment/g" fly.template.toml > fly.toml
    fly deploy
}

deploy_web() {
    # Force deploy to Cloudflare main branch
    if [[ "$environment" == "production" ]]; then
        BRANCH_ARG="--branch=main"
    fi

    echo "Deploying WEB (Cloudflare) with environment: $environment and branch: $BRANCH_ARG"

    
    # Navigate to the web directory and deploy
    cd packages/web
    npm run pages:deploy -- $BRANCH_ARG
}

deploy_aws() {
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
}

# Main deployment switch
case "$component" in
    "api") deploy_api ;;
    "web") deploy_web ;;
    "aws") deploy_aws ;;
    *) print_error_and_exit "Invalid component specified. Use 'api', 'web', or 'aws'." ;;
esac
