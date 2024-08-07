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



# Get the absolute path to the project root directory
PROJECT_ROOT="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.."

cleanup() {
    echo "Stopping services..."
    [ ! -z "$API_PID" ] && kill $API_PID
    [ ! -z "$WEB_PID" ] && kill $WEB_PID
    [ ! -z "$WARNING_PID" ] && kill $WARNING_PID
    echo "Done."
}

datasources() {
    echo -e "Creating datasources... $PROJECT_ROOT/docker-compose.yaml"
    docker-compose -f "$PROJECT_ROOT/docker-compose.yaml" up -d
}


print_error_and_usage() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 [--stack <component>]\n"
    echo -e "Component (optional): 'api', 'web'\n"
    exit 1
}

api_warning() {
    for i in {1..3}; do
        echo -e "${BIYELLOW}The API might take a minute to start but once it's up you won't have to wait so long due to hot reloading!${NC}"
        sleep 5 
    done
}

trap cleanup SIGINT SIGTERM

run_api() {
    cd "$PROJECT_ROOT/services/api"
    echo -e "\nStarting API..."
    api_warning &
    WARNING_PID=$!
    cargo install cargo-watch
    cargo watch -x run &
    API_PID=$!
}

run_web() {
    cd "$PROJECT_ROOT/services/web"
    echo -e "\nStarting Web server...\n"
    npm run dev &
    WEB_PID=$!
}

stack="all"

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --stack) stack="$2"; shift ;;
        *) print_error_and_usage "Invalid argument: $1" ;;
    esac
    shift
done

# Run based on stack argument
case "$stack" in
    "all")
        datasources
        run_api
        run_web
        ;;
    "datasources")
        datasources
        ;;
    "api")
        datasources
        run_api
        ;;
    "web")
        datasources
        run_web
        ;;
    *)
        print_error_and_usage "Invalid stack: $stack"
        ;;
esac

wait
