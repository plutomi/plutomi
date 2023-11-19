#!/bin/bash

# Script to run the API and Web components of the application

# Get the absolute path to the project root directory
PROJECT_ROOT="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.."

cleanup() {
    echo "Stopping services..."
    [ ! -z "$API_PID" ] && kill $API_PID
    [ ! -z "$WEB_PID" ] && kill $WEB_PID
}

print_error_and_usage() {
    echo -e "\n-- ERROR: $1 --\n"
    echo -e "Usage: $0 [component]\n"
    echo -e "Component (optional): 'api', 'web'\n"
    exit 1
}

trap cleanup SIGINT SIGTERM

run_api() {
    # Navigate to the API directory
    cd "$PROJECT_ROOT/packages/api"
    echo "Starting API..."

    # Using cargo-watch to restart on code changes
    cargo install cargo-watch
    cargo watch -x run &
    API_PID=$!
}

run_web() {
    # Navigate to the web directory
    cd "$PROJECT_ROOT/packages/web"
    echo "Starting Web server..."
    npm run dev &
    WEB_PID=$!
}

case "$1" in
    "")
        run_api
        run_web
        ;;
    "api")
        run_api
        ;;
    "web")
        run_web
        ;;
    *)
        print_error_and_usage "Invalid argument: $1"
        ;;
esac

wait
