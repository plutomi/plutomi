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
    [ ! -z "$MIGRATOR_PID" ] && kill $MIGRATOR_PID
    [ ! -z "$CONSUMERS_PID" ] && kill $CONSUMERS_PID
    [ ! -z "$WARNING_PID" ] && kill $WARNING_PID
    echo "Done."
}

print_error_and_usage() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 [--service <component>]\n"
    echo -e "Component (optional): 'api', 'web'\n"
    exit 1
}

rust_warning() {
    local service_name=$1
    echo -e "${BIYELLOW}This $service_name might take a minute to start but once it's up you won't have to wait so long due to hot reloading!${NC}"
}

trap cleanup SIGINT SIGTERM

run_api() {
    cd "$PROJECT_ROOT/services/api"
    echo -e "\nStarting API..."
    rust_warning "API" &
    WARNING_PID=$!
    cargo install cargo-watch
    cargo watch -x run &
    API_PID=$!
}

run_migrator() {
    cd "$PROJECT_ROOT/services/migrator"
    echo -e "\nStarting migrator..."
    WARNING_PID=$!
    cargo run &
    MIGRATOR_PID=$!
}

run_consumers() {
    cd "$PROJECT_ROOT/services/consumers/template"
    echo -e "\nStarting template consumer..."
    rust_warning "template-consumer" &
    WARNING_PID=$!
    cargo install cargo-watch
    cargo watch -x run &
    CONSUMERS_PID=$!
}

run_web() {
    cd "$PROJECT_ROOT/services/web"
    echo -e "\nStarting Web server...\n"
    npm run dev &
    WEB_PID=$!
}

service="all"

# Parse named arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --service) service="$2"; shift ;;
        *) print_error_and_usage "Invalid argument: $1" ;;
    esac
    shift
done

# Run based on service argument
case "$service" in
    "all")
        run_migrator
        run_api
        run_web
        run_consumers
        ;;
    "migrator")
        run_migrator
        ;;
    "api")
        run_api
        ;;
    "web")
        run_web
        ;;
    "consumers")
        run_consumers
        ;;
    *)
        print_error_and_usage "Invalid service: $service"
        ;;
esac

wait
