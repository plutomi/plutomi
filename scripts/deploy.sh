#!/bin/bash


# Define color codes
# Regular Colors
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

# Bold
BBLACK='\033[1;30m'
BRED='\033[1;31m'
BGREEN='\033[1;32m'
BYELLOW='\033[1;33m'
BBLUE='\033[1;34m'
BPURPLE='\033[1;35m'
BCYAN='\033[1;36m'
BWHITE='\033[1;37m'

# Underline
UBLACK='\033[4;30m'
URED='\033[4;31m'
UGREEN='\033[4;32m'
UYELLOW='\033[4;33m'
UBLUE='\033[4;34m'
UPURPLE='\033[4;35m'
UCYAN='\033[4;36m'
UWHITE='\033[4;37m'

# Background
ON_BLACK='\033[40m'
ON_RED='\033[41m'
ON_GREEN='\033[42m'
ON_YELLOW='\033[43m'
ON_BLUE='\033[44m'
ON_PURPLE='\033[45m'
ON_CYAN='\033[46m'
ON_WHITE='\033[47m'

# High Intensity
IBLACK='\033[0;90m'
IRED='\033[0;91m'
IGREEN='\033[0;92m'
IYELLOW='\033[0;93m'
IBLUE='\033[0;94m'
IPURPLE='\033[0;95m'
ICYAN='\033[0;96m'
IWHITE='\033[0;97m'

# Bold High Intensity
BIBLACK='\033[1;90m'
BIRED='\033[1;91m'
BIGREEN='\033[1;92m'
BIYELLOW='\033[1;93m'
BIBLUE='\033[1;94m'
BIPURPLE='\033[1;95m'
BICYAN='\033[1;96m'
BIWHITE='\033[1;97m'

# High Intensity backgrounds
ON_IBLACK='\033[0;100m'
ON_IRED='\033[0;101m'
ON_IGREEN='\033[0;102m'
ON_IYELLOW='\033[0;103m'
ON_IBLUE='\033[0;104m'
ON_IPURPLE='\033[10;95m'
ON_ICYAN='\033[0;106m'
ON_IWHITE='\033[0;107m'

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
