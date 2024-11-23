# TODO set this up properly 
# Local variable to compute home IP CIDR block
locals {
  home_ip_cidr = "${var.home_ip}/32"
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
  count                   = 3
  vpc_id                  = aws_vpc.plutomi_vpc.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    name = "plutomi-${var.environment}-public-subnet-${count.index}"
  }
}


resource "aws_iam_policy_attachment" "ssm_policy_attachment" {
  name       = "attach-ssm-policy"
  roles      = [aws_iam_role.ec2_role.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_subnet" "private_subnet" {
  count                   = 3
  vpc_id                  = aws_vpc.plutomi_vpc.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    name = "plutomi-${var.environment}-private-subnet-${count.index}"
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
  count = 3
  // https://instances.vantage.sh/?min_memory=8&min_vcpus=2&cost_duration=monthly&reserved_term=yrTerm3Standard.noUpfront
  instance_type = "m6a.large"
  # ami                         = "ami-0085e579c65d43668" // Amazon Linux 2023 arm64
  ami      = "ami-063d43db0594b521b" // Amazon Linux 2023 x86_64
  // Servers are in private subnet
  subnet_id                   = aws_subnet.private_subnet[count.index].id
  vpc_security_group_ids      = [aws_security_group.control_plane_security_group.id]
  associate_public_ip_address = false
  availability_zone           = element(data.aws_availability_zones.available.names, count.index)
  depends_on = [
    aws_security_group.control_plane_security_group,
    aws_subnet.public_subnet,
    aws_subnet.private_subnet,
    aws_vpc.plutomi_vpc
  ]

  # Override the root volume
  root_block_device {
    volume_size = 12
    volume_type = "gp3"
  }

  tags = {
    Name = "plutomi-${var.environment}-control-plane-node-${count.index}"
  }

  # Allow ECR and Secrets Manager access
  iam_instance_profile = aws_iam_instance_profile.instance_profile.name

}



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


resource "aws_iam_role" "ec2_role" {
  name = "ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}


resource "aws_iam_instance_profile" "instance_profile" {
  name = "ec2-instance-profile"
  role = aws_iam_role.ec2_role.name
}













############################################################
########### Load Balancer Security Group ###################
############################################################
resource "aws_security_group" "alb_sg" {
  name        = "plutomi-${var.environment}-alb-sg"
  description = "Security group for the ALB"
  vpc_id      = aws_vpc.plutomi_vpc.id

  ingress {
    description = "Allow HTTP traffic from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS traffic from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    name = "plutomi-${var.environment}-alb-sg"
  }
}

############################################################
###################### Load Balancer #######################
############################################################
resource "aws_lb" "application_load_balancer" {
  name                       = "plutomi-${var.environment}-alb"
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.alb_sg.id]
  subnets                    = [for subnet in aws_subnet.public_subnet : subnet.id]
  enable_deletion_protection = false


  tags = {
    name = "plutomi-${var.environment}-alb"
  }
}



############################################################
################### EC2 Target Group #######################
############################################################
resource "aws_lb_target_group" "alb_target_group" {
  name     = "plutomi-${var.environment}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.plutomi_vpc.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }

  tags = {
    name = "plutomi-${var.environment}-tg"
  }
}



############################################################
########### Listener on Port 80 for the instnaces ##########
############################################################
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol    = "HTTPS"
      port        = "443"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.alb_certificate_plutomi.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group.arn
  }
}

############################################################
########### Register the instnaces in the target group ##########
############################################################
resource "aws_lb_target_group_attachment" "control_plane_nodes" {
  count            = length(aws_instance.control_plane_nodes)
  target_group_arn = aws_lb_target_group.alb_target_group.arn
  target_id        = aws_instance.control_plane_nodes[count.index].id
  port             = 80
}




############################################################
########### Certificate Manager for SSL ##########
############################################################


resource "aws_acm_certificate" "alb_certificate_plutomi" {
  domain_name               = var.base_url
  subject_alternative_names = ["*.${var.base_url}"]
  validation_method         = "DNS"

  tags = {
    name = "plutomi-${var.environment}-alb-certificate"
  }
}

resource "aws_acm_certificate_validation" "alb_certificate_validation" {
  certificate_arn         = aws_acm_certificate.alb_certificate_plutomi.arn
  validation_record_fqdns = [cloudflare_record.acm_certificate_validation.name]
}


resource "aws_security_group_rule" "allow_http_from_alb" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = aws_security_group.control_plane_security_group.id
  source_security_group_id = aws_security_group.alb_sg.id
  description              = "Allow HTTP from ALB"
}


# Allocate Elastic IP for NAT instance
resource "aws_eip" "nat_eip" {

}

# NAT instance security group
resource "aws_security_group" "nat_sg" {
  name        = "plutomi-${var.environment}-nat-sg"
  description = "Security group for NAT instance"
  vpc_id      = aws_vpc.plutomi_vpc.id

  ingress {
    description = "Allow inbound traffic from private subnets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [for subnet in aws_subnet.private_subnet : subnet.cidr_block]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "plutomi-${var.environment}-nat-sg"
  }
}

# Create route tables for private subnets
resource "aws_route_table" "private_route_table" {
  count  = length(aws_subnet.private_subnet)
  vpc_id = aws_vpc.plutomi_vpc.id

  tags = {
    Name = "plutomi-${var.environment}-private-rtb-${count.index}"
  }
}

# Associate route tables with private subnets
resource "aws_route_table_association" "private_subnet_association" {
  count          = length(aws_subnet.private_subnet)
  subnet_id      = aws_subnet.private_subnet[count.index].id
  route_table_id = aws_route_table.private_route_table[count.index].id
}

# NAT instance using fck-nat module
module "fck_nat" {
  source  = "RaJiska/fck-nat/aws"
  version = "1.3.0"

  name                          = "plutomi-${var.environment}-nat-gateway"
  vpc_id                        = aws_vpc.plutomi_vpc.id
  subnet_id                     = aws_subnet.public_subnet[0].id
  eip_allocation_ids            = [aws_eip.nat_eip.id]
  additional_security_group_ids = [aws_security_group.nat_sg.id]

  update_route_tables = true
  instance_type       = "t4g.nano"
  route_tables_ids = {
    for index, rtb in aws_route_table.private_route_table : "private-rtb-${index}" => rtb.id
  }
}

