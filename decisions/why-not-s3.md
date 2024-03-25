### Why R2 instead of S3?

https://twitter.com/QuinnyPig/status/1443076111651401731

> One final point: Now let’s remember that the internet is 1-to-many. If 1 million people download that 1GB this month, my cost with @cloudflare R2 this way rounds up to 13¢. With @awscloud S3 it’s $59,247.52.

The only missing feature from S3 is the file upload notifications which I don't _currently_ need, and I believe Cloudflare will add it in the future by the time I do. I'm already paying for Cloudflare so I figured why not keep things there as well. There is no lock in, we still use the S3 client so it should just be switching a URL in the code if you want to use S3.
