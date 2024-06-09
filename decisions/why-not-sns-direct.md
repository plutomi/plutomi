### Why aren't you sending SES/SNS events directly to your API?

1. This is not async. We should be able to process them at our own speed.
2. There is no way to add security headers or anything to the request, so we can't really verify it came from AWS from what I've read. Either way, #1 is more important
