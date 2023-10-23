#!/bin/bash

# Default profile
AWS_PROFILE="--profile=plutomi-dev"
DEPLOYMENT_ENVIRONMENT="development"

# Check the provided argument
case "$1" in
  "production")
    AWS_PROFILE="--profile=plutomi-prod"
    DEPLOYMENT_ENVIRONMENT="production"
    ;;
  "staging")
    AWS_PROFILE="--profile=plutomi-stage"
    DEPLOYMENT_ENVIRONMENT="staging"
    ;;
  *)
    # Notify the user that the default 'development' is used
    for i in {1..3}; do
      echo -e "\n\n-- No valid deployment environment specified, defaulting to '$AWS_PROFILE' and '$DEPLOYMENT_ENVIRONMENT'. --\n\n"
      sleep 2
    done
    ;;
esac

# Navigate to the WEB directory
cd packages/aws

echo -e "\n\nFINAL WARNING: \n\n ---> DEPLOYING TO AWS WITH '$AWS_PROFILE' & '$DEPLOYMENT_ENVIRONMENT'\n\n"
sleep 7

# Run the npm deploy command with the selected profile
AWS_PROFILE=$AWS_PROFILE DEPLOYMENT_ENVIRONMENT=$DEPLOYMENT_ENVIRONMENT npm run deploy 
