#!/bin/bash

# Ensure an environment argument is provided
if [ -z "$1" ]; then
  echo "Please provide an environment name: 'staging' or 'production'"
  exit 1
fi

# Navigate to the WEB directory
cd packages/web

# Run the npm deploy command with the provided environment
ENV=$1 npm run pages:deploy
