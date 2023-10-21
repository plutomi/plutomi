#!/bin/bash


# Function to handle SIGINT (Ctrl+C)
cleanup() {
    echo "Stopping API..."
    kill $PID
}

trap cleanup SIGINT SIGTERM


# Navigate to the API directory
cd packages/api

# Build the Rust application
cargo run

# Store the PID of the background process
PID=$!

# Wait indefinitely
wait $PID
