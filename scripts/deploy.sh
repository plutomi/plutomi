#!/bin/bash

# Function to print error message and usage
print_error_and_exit() {
    echo -e "\nERROR: $1 \n"
    echo -e "Usage: $0 [--stack <stack>] [--env <environment>]\n"
    echo -e "Stack (optional): aws"
    echo -e "Environment (optional): development, staging, production"
    echo -e "If no stack is provided, all stacks will be deployed to staging.\n"
    echo -e "Example: $0 --stack aws --env production\n"
    exit 1
}

# Default values
stack=""
environment="development" # Default to 'development' if no environment is provided

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
    # export NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT=$environment
    npm run deploy -- --profile $AWS_PROFILE
    )
}


# Main deployment logic
if [ -z "$stack" ]; then
    # Deploy all stacks if no specific stack is provided
    deploy_all
else
    # Validate stack
    [[ "$stack" =~ ^(aws)$ ]] || print_error_and_exit "Invalid stack: $stack. Must be 'aws'."
    [ "$environment" == "development" -a "$stack" != "aws" ] && print_error_and_exit "There is no 'dev' environment for '$stack', run things locally :D"

    # Deploy specific stack
    case "$stack" in
        "aws") deploy_aws ;;
        *) print_error_and_exit "Invalid stack specified. Use 'aws'." ;;
    esac
fi
