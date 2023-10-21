#!/bin/bash

# Navigate to the API directory
cd packages/api

# Deploy - dockerfile will build the app for us
fly deploy
