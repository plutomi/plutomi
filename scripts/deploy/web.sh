#!/bin/bash



BRANCH_ARG=""

# Check if an argument is provided
if [ "$1" == "production" ]; then
# Deploy to prod, otherwise deploy to staging on each branch PR
  BRANCH_ARG="--branch=main"
fi


# Navigate to the WEB directory
cd packages/web

echo -e "\n\n-- DEPLOYING WEB ON BRANCH '$BRANCH_ARG' --\n\n"
sleep 5

# Run the npm deploy command with the provided environment
$BRANCH_ARG npm run pages:deploy  # TODO This isnt working
