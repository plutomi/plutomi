#!/bin/bash



BRANCH_ARG=""

# Check if an argument is provided
if [ "$1" == "production" ]; then
# Deploy to prod, otherwise deploy to staging on each branch PR
  BRANCH_ARG="--branch=main"
fi


# If the default 'staging' is used, notify the user in red letters
if [ "$1" != "production" ]; then
  for i in {1..3}; do
    echo -e "\n\n-- No environment specified, defaulting to preview environment of current branch name. --\n\n"
    done
fi

# Navigate to the WEB directory
cd packages/web

# Run the npm deploy command with the provided environment
npm run pages:deploy $BRANCH_ARG
