#!/bin/bash


cd scripts/curl


URL="https://webhook.site/7e14f478-80c0-4db4-aef5-7c6fade002ae"
PAYLOAD="payloads/request-totp.json"

curl -X POST -H "Content-Type: application/json" -d @$PAYLOAD $URL
