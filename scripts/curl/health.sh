#!/bin/bash

cd scripts/curl

URL=http://localhost:8080/health

curl -X GET $URL
