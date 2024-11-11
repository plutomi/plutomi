# TODO set this up properly 
# Local variable to compute home IP CIDR block
locals {
  home_ip_cidr = "${var.home_ip}/32"
}


# Creates an SSH key pair for EC2 instances
resource "tls_private_key" "k3s_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "aws_key_pair" "k3s_key_pair" { # TODO rename
  key_name   = "k3s_key_pair"
  public_key = tls_private_key.k3s_key.public_key_openssh
}

output "ssh_private_key" {
  value     = tls_private_key.k3s_key.private_key_pem
  sensitive = true
}


resource "aws_vpc" "plutomi_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    name = "plutomi-${var.environment}-vpc"
  }
}


resource "aws_subnet" "public_subnet" {
  count                   = 3 # 1 per AZ
  vpc_id                  = aws_vpc.plutomi_vpc.id
  cidr_block              = cidrsubnet(var.public_subnet_cidr, 4, count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    name = "plutomi-${var.environment}-public-subnet-${count.index}"
  }
}
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.plutomi_vpc.id

  tags = {
    name = "plutomi-${var.environment}-control-plane-igw"
  }
}

resource "aws_route_table" "public_route" {
  vpc_id = aws_vpc.plutomi_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    name = "plutomi-${var.environment}-control-plane-public-route-table"
  }
}

resource "aws_route_table_association" "public_subnet_association" {
  count          = 3
  subnet_id      = aws_subnet.public_subnet[count.index].id
  route_table_id = aws_route_table.public_route.id
}


resource "aws_security_group" "control_plane_security_group" {
  name        = "control_plane_security_group"
  description = "Security group for K3s cluster control plane"
  vpc_id      = aws_vpc.plutomi_vpc.id
  tags = {
    name = "plutomi-${var.environment}-control-plane-security-group"
  }
}

resource "aws_vpc_security_group_egress_rule" "control_plane_outbound" {
  security_group_id = aws_security_group.control_plane_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_ingress_rule" "control_plane_api_access" {
  security_group_id = aws_security_group.control_plane_security_group.id
  from_port         = 6443
  to_port           = 6443
  ip_protocol       = "tcp"
  cidr_ipv4         = local.home_ip_cidr
  description       = "Allow API access from home IP"
}

resource "aws_vpc_security_group_ingress_rule" "control_plane_ssh_access" {
  security_group_id = aws_security_group.control_plane_security_group.id
  from_port         = 22
  to_port           = 22
  ip_protocol       = "tcp"
  cidr_ipv4         = local.home_ip_cidr
  description       = "Allow SSH access from home IP"
}


resource "aws_vpc_security_group_ingress_rule" "control_plane_server_intranode" {
  security_group_id            = aws_security_group.control_plane_security_group.id
  referenced_security_group_id = aws_security_group.control_plane_security_group.id
  from_port                    = 6443
  to_port                      = 6443
  ip_protocol                  = "tcp"
  description                  = "Allow K3s API server communication between nodes"

}


resource "aws_vpc_security_group_ingress_rule" "control_plane_node_port" {
  security_group_id            = aws_security_group.control_plane_security_group.id
  referenced_security_group_id = aws_security_group.control_plane_security_group.id
  from_port                    = 30000
  to_port                      = 32767
  ip_protocol                  = "tcp"
  description                  = "Allow NodePort services"

}


resource "aws_vpc_security_group_ingress_rule" "control_plane_etcd" {
  security_group_id            = aws_security_group.control_plane_security_group.id
  referenced_security_group_id = aws_security_group.control_plane_security_group.id
  from_port                    = 2379
  to_port                      = 2380
  ip_protocol                  = "tcp"
  description                  = "Allow etcd communication between nodes"

}



resource "aws_vpc_security_group_ingress_rule" "control_plane_flannel" {
  security_group_id            = aws_security_group.control_plane_security_group.id
  referenced_security_group_id = aws_security_group.control_plane_security_group.id
  from_port                    = 8472
  to_port                      = 8472
  ip_protocol                  = "udp"
  description                  = "Allow Flannel VXLAN traffic"

}


resource "aws_vpc_security_group_ingress_rule" "control_plane_metrics" {
  security_group_id            = aws_security_group.control_plane_security_group.id
  referenced_security_group_id = aws_security_group.control_plane_security_group.id
  from_port                    = 10250
  to_port                      = 10250
  ip_protocol                  = "tcp"
  description                  = "Allow Kubelet metrics"

}

data "aws_availability_zones" "available" {
  state = "available"
}




resource "aws_instance" "control_plane_nodes" {
  # TODO add name!!!
  count = 3
  // https://instances.vantage.sh/?min_memory=8&min_vcpus=2&cost_duration=monthly&reserved_term=yrTerm3Standard.noUpfront
  instance_type = "m6a.large"
  # ami                         = "ami-0085e579c65d43668" // Amazon Linux 2023 arm64
  ami                         = "ami-063d43db0594b521b" // Amazon Linux 2023 x86_64
  key_name                    = aws_key_pair.k3s_key_pair.key_name
  subnet_id                   = aws_subnet.public_subnet[count.index].id
  vpc_security_group_ids      = [aws_security_group.control_plane_security_group.id]
  associate_public_ip_address = true
  availability_zone           = element(data.aws_availability_zones.available.names, count.index)
  depends_on = [
    aws_security_group.control_plane_security_group,
    aws_subnet.public_subnet,
    aws_vpc.plutomi_vpc
  ]

  # Override the root volume
  root_block_device {
    volume_size = 12
    volume_type = "gp3"
  }

}


############################################################


## This creates an SES identity, an SNS topic, and an SQS queue to be used for email notifications.

# Queue for SES Events
resource "aws_sqs_queue" "events_queue" {
  name       = var.ses_events_queue_name
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
  domain                 = aws_ses_domain_identity.ses_email_identity.domain
  mail_from_domain       = "${var.mail_from_subdomain}.${var.base_url}"
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




# Create the Secrets Manager secret
resource "aws_secretsmanager_secret" "my_app_secret" {
  name = "plutomi-secrets"
}

# Add key-value pairs to the secret
resource "aws_secretsmanager_secret_version" "my_app_secret_version" {
  secret_id = aws_secretsmanager_secret.my_app_secret.id

  secret_string = jsonencode({
    // Sample TODO
    db_username = "my_db_username"
    db_password = "my_db_password"
    api_key     = "my_api_key"
    other_key   = "other_value"
  })
}


# Create IAM user for accessing Secrets Manager
resource "aws_iam_user" "secrets_manager_user" {
  name = "secrets-manager-access-user"
}


# Define the IAM policy for restricted Secrets Manager access
resource "aws_iam_policy" "secrets_manager_ip_restricted" {
  name        = "secrets-manager-ip-restricted"
  description = "Allows access to Secrets Manager only from specific IP addresses"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          # Allows retrieving values from Secrets Manager for things like DB credentials and third party API keys
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        "Resource" : aws_secretsmanager_secret.my_app_secret.arn,
        # "Condition": { TODO
        #   "IpAddress": {
        #     "aws:SourceIp": [
        #       "YOUR_SERVER_IP_1",
        #       "YOUR_SERVER_IP_2",
        #       "YOUR_SERVER_IP_3"
        #     ]
        #   }
        # }
      },
      {
        "Effect" : "Allow",
        "Action" : [
          // Allows retrieving an ECR authorization token, which is necessary for logging in to ECR to pull images
          "ecr:GetAuthorizationToken"
        ],
        "Resource" : "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          // Allows checking the availability of ECR layers and getting image download URLs
          // https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        "Resource" : [
          for repo in aws_ecr_repository.repositories : repo.arn
        ]
      }
    ]
  })
}


# TODO Remove

# Attach the IP-restricted policy to the user
resource "aws_iam_user_policy_attachment" "secrets_manager_policy_attachment" {
  user       = aws_iam_user.secrets_manager_user.name
  policy_arn = aws_iam_policy.secrets_manager_ip_restricted.arn
}

# TODO Remove

# Generate access keys for the IAM user
resource "aws_iam_access_key" "secrets_manager_access_key" {
  user = aws_iam_user.secrets_manager_user.name
}




# TODO Remove


# Output access key and secret key (for secure storage in Kubernetes)
output "aws_access_key_id" {
  value     = aws_iam_access_key.secrets_manager_access_key.id
  sensitive = true
}


output "aws_secret_access_key" {
  value     = aws_iam_access_key.secrets_manager_access_key.secret
  sensitive = true
}
