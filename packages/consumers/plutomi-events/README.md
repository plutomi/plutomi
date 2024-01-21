#### Processes plutomi events

This consumes all Plutomi events and takes action on them. This is the main consumer for Plutomi. Eventually,
we will fan out from EventBridge to many different consumers but that is overkill for now.
