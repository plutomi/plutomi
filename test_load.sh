declare -A instanceCounts

for i in {1..10000}; do
    response=$(curl -k -s --insecure 'https://plutomi-load-balancer-775549393.us-east-1.elb.amazonaws.com/api/health')
    identifier=$(echo "$response" | jq -r '.identifier')
    
    # Check if the identifier is already in the array, if not initialize it
    if [ ! "${instanceCounts["$identifier"]+isset}" ]; then
        instanceCounts["$identifier"]=0
    fi

    instanceCounts["$identifier"]=$((instanceCounts["$identifier"]+1))
    ((i % 50 == 0)) && sleep 1
done

for id in "${!instanceCounts[@]}"; do
    echo "$id: ${instanceCounts["$id"]}"
done
