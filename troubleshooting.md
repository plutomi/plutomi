#### Some common errors that you _might_ encounter:

> Argument of type 'this' is not assignable to parameter of type 'Construct'

Make sure all of your `@aws-cdk/*` dependencies are running the same version + make sure whatever you are using in the construct is actually being imported at the top of the file

> ERROR [internal] load metadata for public.ecr.aws/sam/build-nodejs (...) failed to solve with frontend dockerfile.v0: failed to create LLB definition: unexpected status code [manifests latest]: 403 Forbidden

Try running this command to log in again: `aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/sam/build-nodejs`

> Error: Cannot perform an interactive login from a non TTY device

Not 100% on this but ended up reinstalling AWS CLIv2 and it got fixed.
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

> `Resource_Name` cannot be deleted as it is in use by `Another_Resource`

https://github.com/aws/aws-cdk/issues/3414

TLDR: Try updating the stack that is using the removed stack with the `-e` flag first

> "Runtime.HandlerNotFound: index.main is undefined or not exported",

Make sure the only thing you are exporting from a function is the function itself: `module.exports.main`, even exporting a type or interface will cause this error
