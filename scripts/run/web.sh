#!/bin/bash

cleanup() {
    echo "Stopping web server..."
    kill $WEB_PID
}

trap cleanup SIGINT SIGTERM

# Navigate to the API directory
cd packages/web

# Run the NextJS app
npm run dev &

WEB_PID=$!
wait $WEB_PID
