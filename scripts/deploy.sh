#!/bin/bash

# Check if two arguments are not provided
if [ $# -ne 2 ]; then
    echo -e "\n-- ERROR: Invalid number of arguments --\n"
    echo -e "Usage: $0 <component> <environment>\n"
    echo -e "Component: 'api', 'web', or 'aws'\n"
    echo -e "Environment: 'staging' or 'production'\n"
    exit 1
fi

component=$1
environment=$2


if [[ "$component" != "api" && "$component" != "web" && "$component" != "aws" ]]; then
    echo "Invalid component: $component. Must be either 'web', 'api', or 'aws'."
    exit 1
fi

if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
    echo "Invalid environment: '$environment'. Must be either 'staging' or 'production'."
    exit 1
fi


case "$component" in
    #########################################
    ####### Handle API deployment ###########
    #########################################
    "api")
    # Navigate to the API directory
    cd packages/api

    # Create a fly.toml file with the correct environment & deploy
    sed "s/{{ENV}}/$environment/g" fly.template.toml > fly.toml
    fly deploy
    ;;

    #########################################
    ####### Handle WEB deployment ###########
    #########################################
    "web")

    ### Force deployment to production
    if [[ "$environment" == "production" ]]; then
        BRANCH_ARG="--branch=main"
    else
        BRANCH_ARG=""
    fi

    # Navigate to the WEB directory
    cd packages/web

    # Deploy FE to Cloudflare
    npm run pages:deploy -- $BRANCH_ARG
    ;;

    #########################################
    ####### Handle AWS deployment ###########
    #########################################
    "aws")

    AWS_PROFILE="--profile=plutomi-dev"
    DEPLOYMENT_ENVIRONMENT="development"

    if [[ "$environment" == "production" ]]; then
        AWS_PROFILE="--profile=plutomi-prod"
        DEPLOYMENT_ENVIRONMENT="production"
    else if [[ "$environment" == "staging" ]]; then
        AWS_PROFILE="--profile=plutomi-stage"
        DEPLOYMENT_ENVIRONMENT="staging"
    fi


    # Navigate to the WEB directory
    cd packages/aws

    
    # Run the npm deploy command with the selected profile
    npm run deploy -- $AWS_PROFILE $DEPLOYMENT_ENVIRONMENT
    ;;
  *)
    echo "Invalid component specified. Use 'api', 'web', or 'aws'."
    exit 1
    ;;
esac

# The rest of your deployment logic goes here
