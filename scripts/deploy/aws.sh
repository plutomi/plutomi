#!/bin/bash

# Default profile
AWS_PROFILE="plutomi-dev"

# Check the provided argument
case "$1" in
  "production")
    AWS_PROFILE="plutomi-prod"
    ;;
  "staging")
    AWS_PROFILE="plutomi-stage"
    ;;
  *)
    # Notify the user that the default 'development' is used
    for i in {1..3}; do
      echo -e "\n\n-- No valid environment deployment specified, defaulting to 'development'. --\n\n"
      sleep 2
    done
    ;;
esac

# Navigate to the WEB directory
cd packages/aws

echo -e "\n\n-- DEPLOYING TO AWS WITH PROFILE '$AWS_PROFILE' --\n\n"
sleep 7

# Run the npm deploy command with the selected profile
npm run deploy --profile=$AWS_PROFILE
