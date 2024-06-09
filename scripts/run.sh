#!/bin/bash

# Script to run the API and Web components of the application

# Get the absolute path to the project root directory
PROJECT_ROOT="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.."

cleanup() {
    echo "Stopping services..."
    [ ! -z "$API_PID" ] && kill $API_PID
    [ ! -z "$WEB_PID" ] && kill $WEB_PID
    echo "Done."
}

datasources() {
    echo "Creating datasources..."
    docker-compose -f "$PROJECT_ROOT/docker-compose.yaml" up -d
    trap "docker-compose -f '$PROJECT_ROOT/docker-compose.yaml' down; echo 'Docker services stopped.'" EXIT
}


print_error_and_usage() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 [--stack <component>]\n"
    echo -e "Component (optional): 'api', 'web'\n"
    exit 1
}

trap cleanup SIGINT SIGTERM

run_api() {
    # Navigate to the API directory
    cd "$PROJECT_ROOT/services/api"
    echo "Starting API..."
    cargo install cargo-watch
    cargo watch -x run &
    API_PID=$!
}

run_web() {
    # Navigate to the web directory
    cd "$PROJECT_ROOT/services/web"
    echo "Starting Web server..."
    npm run dev &
    WEB_PID=$!
}

# Default stack to run both if not specified
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
        run_api
        ;;
    "web")
        run_web
        ;;
    *)
        print_error_and_usage "Invalid stack: $stack"
        ;;
esac

wait
