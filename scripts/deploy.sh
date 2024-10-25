#!/bin/bash

# Define color codes
# Bold High Intensity
BIRED='\033[1;91m'
BIGREEN='\033[1;92m'
BIYELLOW='\033[1;93m'
BIWHITE='\033[1;97m'

# High Intensity backgrounds
ON_IRED='\033[0;101m'
ON_ICYAN='\033[0;106m'

# No Color
NC='\033[0m' # No Color


# Function to print error message and usage
print_error_and_exit() {
    echo -e "${BIWHITE}${ON_IRED}\n\nERROR: $1 \n${BIWHITE}${NC}"
    echo -e "Environment must be one of: ${BIGREEN}development${NC} | ${BIYELLOW}staging${NC} | ${BIRED}production${NC}\n"
    echo -e "Example: ${BIWHITE}$0 production${NC}\n"
    echo -e "Make sure to set the environment variables in '${BIWHITE}aws/.env' so CDK can deploy correctly.\n"
    exit 1
}


# Function to log in to AWS SSO
aws_login() {
    local profile=$1
    if aws sso login --profile "$profile"; then
        export AWS_PROFILE="$profile"
        echo -e "${BIWHITE}Logged in and set AWS_PROFILE to ${COLOR}$profile${NC}"
    else
        echo -e "${ON_IRED}${BIWHITE}Login failed${NC}"
        exit 1
    fi
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


    # Log in to AWS SSO with the determined profile
    aws_login "$AWS_PROFILE"

    echo -e "${BIWHITE}Deploying soon...\n\nEnvironment: ${COLOR}$environment${BIWHITE}\nProfile: ${COLOR}$AWS_PROFILE${NC}\n\n"


    # Countdown to deployment with option to cancel
    local countdown_time=5
    echo -e "${ON_ICYAN}\n\nPress any key to cancel the deployment.\n\n\n${NC}"
    while [ $countdown_time -gt 0 ]; do
        # Check for any key press
        read -t 1 -n 1 -s
        if [ $? -eq 0 ]; then
            echo -e "\n\n${BIRED}Deployment canceled.${NC}"
            exit 0
        fi

        echo -ne "${BIWHITE}Starting deployment in ${COLOR}$countdown_time${BIWHITE} seconds...\r"
        ((countdown_time--))
    done
    echo -e "\n"


    # Export the environment variable so it can be picked up by CDK # TODO remove
    export ENVIRONMENT=$environment

    cd ./aws
    npm run deploy -- --profile $AWS_PROFILE # Set the right profile for permissions
}

# Deploy AWS
deploy_aws
