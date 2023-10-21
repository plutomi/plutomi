#!/bin/bash

# Navigate to the API directory
cd packages/api

# Build the Go application
go build -o main

# Run the built binary
./main
