- ERROR [internal] load metadata for public.ecr.aws/sam/build-nodejs{VERSION_HERE}

AND

- failed to solve with frontend dockerfile.v0: failed to create LLB definition: unexpected status code [manifests latest]: 403 Forbidden

##### Login to ECR again:

`aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/amazonlinux`
