#### Processes plutomi events

These are things like TOTP codes, notification emails etc that we do not necessarily want to handle on the API server.
Eventually we will fan-out to multiple consumers for each event type, but right now that is overkill
