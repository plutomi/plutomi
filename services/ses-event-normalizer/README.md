### SES Event Normalizer

This consumer picks up events from SQS that were sent from SES and normalizes them to be sent to the main topic to be processed. This does not handle them or take any action on them, it's only job is to put them in a common format for use later on. Things like bounces / complaints will be handled by other consumers and disable email functionality for the user / applicant.
