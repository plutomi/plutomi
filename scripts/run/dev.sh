#!/bin/bash

# Function to stop both the API and the web server
stop_all() {
    kill $API_PID $WEB_PID
}

# Set the trap
trap stop_all SIGINT SIGTERM

./scripts/run/api.sh &
API_PID=$!

./scripts/run/web.sh &
WEB_PID=$!

# Wait for both processes
wait $API_PID $WEB_PID
