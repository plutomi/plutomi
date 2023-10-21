#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide an environment name: 'staging' or 'production'"
  exit 1
fi

# Determine the configuration file based on the environment argument
if [ "$1" == "staging" ]; then
  CONFIG="./fly.staging.toml"
elif [ "$1" == "production" ]; then
  CONFIG="./fly.production.toml"
else
  echo "Invalid environment name. Please use 'staging' or 'production'."
  exit 1
fi


# Navigate to the API directory
cd packages/api

# Deploy using the determined configuration
fly deploy --config $CONFIG
