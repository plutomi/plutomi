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
  "api")
  # Navigate to the API directory
  cd packages/api
  sed "s/{{ENV}}/$environment/g" fly.template.toml > fly.toml
  fly deploy
    ;;
  "web")
    ;;
    "aws")
    ;;
  *)
    echo "Invalid component specified. Use 'api' or 'web'."
    exit 1
    ;;
esac

# The rest of your deployment logic goes here
