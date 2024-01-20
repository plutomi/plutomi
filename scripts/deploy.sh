#!/bin/bash

# Define color codes
# Bold High Intensity
BIRED='\033[1;91m'
BIGREEN='\033[1;92m'
BIYELLOW='\033[1;93m'
BIWHITE='\033[1;97m'

# High Intensity backgrounds
ON_IRED='\033[0;101m'

# No Color
NC='\033[0m' # No Color


# Function to print error message and usage
print_error_and_exit() {
    echo -e "${ON_IRED}${BIWHITE}\n\nERROR: $1 \n${BIWHITE}${NC}"
    echo -e "Environment must be one of: ${BIGREEN}development${NC} | ${BIYELLOW}staging${NC} | ${BIRED}production${NC}\n"
    echo -e "Example: ${BIWHITE}$0 production${NC}\n"
    echo -e "Make sure to set the environment variables in '${BIWHITE}packages/aws/.env.${BIGREEN}development${NC}|${BIYELLOW}staging${NC}|${BIRED}production${NC}' so CDK can deploy correctly.\n"
    exit 1
}

# Check if an environment argument is provided
if [ "$#" -ne 1 ]; then
    print_error_and_exit "Environment argument is required but none was provided."
fi

# Assign the first argument to environment
environment=$1

# Validate environment
[[ "$environment" =~ ^(staging|production|development)$ ]] || print_error_and_exit "Invalid environment: '$environment'."

deploy_aws() {
    # Set AWS_PROFILE based on the environment
    if [[ "$environment" == "production" ]]; then
        AWS_PROFILE="plutomi-prod"
        COLOR=$BIRED
    elif [[ "$environment" == "staging" ]]; then
        AWS_PROFILE="plutomi-stage"
        COLOR=$BIYELLOW
    elif [[ "$environment" == "development" ]]; then
        AWS_PROFILE="plutomi-dev"
        COLOR=$BIGREEN
    else
        print_error_and_exit "Invalid environment for AWS deployment."
    fi

    echo -e "${BIWHITE}Deploying to AWS with environment: ${COLOR}$environment${BIWHITE} and profile: ${COLOR}$AWS_PROFILE${NC}"
    sleep 2
    echo -e "${BIWHITE}Deploying to AWS with environment: ${COLOR}$environment${BIWHITE} and profile: ${COLOR}$AWS_PROFILE${NC}"
    sleep 2
    echo -e "${BIWHITE}Deploying to AWS with environment: ${COLOR}$environment${BIWHITE} and profile: ${COLOR}$AWS_PROFILE${NC}"
    sleep 2


    cd packages/aws
    npm run deploy -- --profile $AWS_PROFILE
}

# Deploy AWS
deploy_aws
