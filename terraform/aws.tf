## This creates an SES identity, an SNS topic, and an SQS queue to be used for email notifications.

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


# SES Domain DKIM
resource "aws_ses_domain_dkim" "ses_dkim" {
  domain = aws_ses_domain_identity.ses_email_identity.domain
}

# Output DKIM tokens for verification to be used in Cloudflare DNS
output "dkim_tokens" {
  value = aws_ses_domain_dkim.ses_dkim.dkim_tokens
}


# Mail From Domain 
## ! This might take 72 hours to propagate!
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



# Create the ECR Repositories
resource "aws_ecr_repository" "repositories" {
  for_each             = toset(var.ecr_repositories)
  name                 = each.value
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    environment = var.environment
  }
}
# Output the repository URLs
output "ecr_repo_urls" {
  value = { for repo, details in aws_ecr_repository.repositories : repo => details.repository_url }
}
