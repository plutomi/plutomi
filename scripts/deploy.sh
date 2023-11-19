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
    # Navigate to the WEB directory and deploy
    cd packages/web
    [ "$environment" == "production" ] && BRANCH_ARG="--branch=main" || BRANCH_ARG=""
    npm run pages:deploy -- $BRANCH_ARG
}

deploy_aws() {
    # Set AWS profile and environment, then deploy
    local aws_profile="--profile=plutomi-${environment}"
    cd packages/aws
    npm run deploy -- $aws_profile $environment
}

# Main deployment switch
case "$component" in
    "api") deploy_api ;;
    "web") deploy_web ;;
    "aws") deploy_aws ;;
    *) print_error_and_exit "Invalid component specified. Use 'api', 'web', or 'aws'." ;;
esac
