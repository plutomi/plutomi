## This creates an SES identity, an SNS topic, and an SQS queue to be used for email notifications.


# Creates a DynamoDB table for Terraform state locking
# resource "aws_dynamodb_table" "terraform_locks" {
#   name           = "terraform-lock-table"
#   billing_mode   = "PAY_PER_REQUEST"
#   hash_key       = "LockID"

#   attribute {
#     name = "LockID"
#     type = "S"
#   }
# }


# Queue for SES Events
resource "aws_sqs_queue" "events_queue" {
  name = var.ses_events_queue_name
  fifo_queue = false
  tags = {
    environment = var.environment
  }
}


# SES Configuration Set
resource "aws_ses_configuration_set" "ses_configuration_set" {
  name = var.ses_configuration_set_name
}

# SES Identity (Domain)
resource "aws_ses_domain_identity" "ses_email_identity" {
  domain = var.base_url

}

# Mail From Domain
resource "aws_ses_domain_mail_from" "mail_from_domain" {
  domain           = aws_ses_domain_identity.ses_email_identity.domain
  mail_from_domain = "${var.mail_from_subdomain}.${var.base_url}"
  behavior_on_mx_failure = "UseDefaultValue"
}

# SNS Topic
resource "aws_sns_topic" "ses_events_topic" {
  name         = var.ses_events_topic_name
  display_name = var.ses_events_topic_name
  tags = {
    environment = var.environment
  }
}

# SES Event Destination
resource "aws_ses_event_destination" "ses_event_destination" {
  configuration_set_name = aws_ses_configuration_set.ses_configuration_set.name
  name                   = var.ses_event_destination_name
  enabled                = true

  sns_destination {
    topic_arn = aws_sns_topic.ses_events_topic.arn
  }

    matching_types = [
    "send", 
    "delivery", 
    "bounce", 
    "complaint", 
    "reject", 
    "open", 
    "click", 
    "renderingFailure"
  ]
}

# SQS Queue Subscription
resource "aws_sns_topic_subscription" "ses_topic_subscription" {
  topic_arn = aws_sns_topic.ses_events_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.events_queue.arn
}
