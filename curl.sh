#!/bin/bash

# URL to curl
url="https://plutomi.com"

# Interval between requests, in seconds
interval=0.02

while true; do
  echo -n "$(date "+%Y-%m-%dT%H:%M:%S%z") - HTTP Status: "
  curl -o /dev/null -s -w "%{http_code}\n" "$url"
  sleep $interval
done

