#### Process events from SES

This will take the events below:
https://docs.aws.amazon.com/ses/latest/dg/monitor-using-event-publishing.html

Convert them to a standard format and send them to the event bus where the `plutomi-events` consumer will take action on it. If we need anymore data in that consumer, we can add it here before sending it to the event bus.
