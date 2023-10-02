import {
  AmiHardwareType,
  AsgCapacityProvider,
  Cluster,
  EcsOptimizedImage,
  PlacementConstraint,
  PlacementStrategy,
  type FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import { Port, SubnetType, UserData, type Vpc } from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  AutoScalingGroup,
  TerminationPolicy
} from "aws-cdk-lib/aws-autoscaling";
import { env } from "./env";
import {
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_THRESHOLD_SECONDS,
  INSTANCE_TYPE,
  MAX_NUMBER_OF_INSTANCES,
  MIN_NUMBER_OF_INSTANCES,
  NUMBER_OF_CONTAINERS_PER_INSTANCE
} from "./config";

type CreateEc2ServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

const clusterName = "plutomi-cluster";
const capacityProviderName = "plutomi-capacity-provider";
const serviceName = "plutomi-service";
const loadBalancerName = "plutomi-load-balancer";
// This needs to be unique in some deployment use cases
const autoScalingGroupName = `plutomi-autoscaling-group-${new Date().getTime()}`;

export const createEc2Service = ({
  stack,
  taskDefinition,
  certificate,
  vpc,
  natGatewayProvider
}: CreateEc2ServiceProps): ApplicationLoadBalancedEc2Service => {
  const cluster = new Cluster(stack, clusterName, {
    vpc,
    clusterName
  });

  const autoscalingGroup = cluster.addCapacity(capacityProviderName, {
    autoScalingGroupName,
    instanceType: INSTANCE_TYPE,
    machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.ARM),
    minCapacity: MIN_NUMBER_OF_INSTANCES,
    maxCapacity: MAX_NUMBER_OF_INSTANCES,

    vpcSubnets: {
      // Ensure that our instances are in a private subnet
      subnetType: SubnetType.PRIVATE_WITH_EGRESS
    },

    defaultInstanceWarmup: Duration.seconds(0)
  });

  // Required for non default clusters
  // https://stackoverflow.com/questions/36523282/aws-ecs-error-when-running-task-no-container-instances-were-found-in-your-clust
  autoscalingGroup.addUserData(
    "#!/bin/bash",
    `echo ECS_CLUSTER=${clusterName} >> /etc/ecs/ecs.config`,
    "sudo yum update -y",
    "sudo yum clean all"
  );

  const ec2Service = new ApplicationLoadBalancedEc2Service(stack, serviceName, {
    cluster,
    certificate,
    taskDefinition,

    // The load balancer will be public, but our tasks will not.
    // Outbound traffic for the tasks will be provided by the NAT Gateway
    // assignPublicIp: false,
    publicLoadBalancer: true,
    serviceName,
    loadBalancerName,
    desiredCount: MIN_NUMBER_OF_INSTANCES * NUMBER_OF_CONTAINERS_PER_INSTANCE,
    // Note: Ensure that the instance type can handle a 200% increase in tasks if only running one
    minHealthyPercent: 50,
    maxHealthyPercent: 200
  });

  // --- Autoscaling ---
  ec2Service.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    String(HEALTH_CHECK_THRESHOLD_SECONDS)
  );

  // Health Checks
  ec2Service.targetGroup.configureHealthCheck({
    // https://nathanpeck.com/speeding-up-amazon-ecs-container-deployments/
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    interval: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS),
    timeout: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS - 1),
    path: HEALTH_CHECK_PATH
  });

  // Allow our LB to connect to our instances only
  ec2Service.loadBalancer.connections.allowTo(autoscalingGroup, Port.allTcp());

  /**
   * Allow instances to talk to the internet & MongoDB
   * Needs to pass through the NAT gateway for internet access
   */
  //
  const outboundPorts = [
    443, // HTTPS from tasks
    27017 // MongoDB from tasks - TODO Replace with Private Link in the future
  ];

  outboundPorts.forEach((port) => {
    natGatewayProvider.connections.allowFrom(autoscalingGroup, Port.tcp(port));
  });

  return ec2Service;
};

/**
 * Questions to answer:
 * Why were tasks deregistered from the target group before 1. new tasks were placed 2. no new instance was up:
 * 
 * Started at
Message
Event ID
September 27, 2023 at 01:45 (UTC+3:00)	service plutomi-service was unable to place a task because no container instance met all of its requirements. The closest matching container-instance 2811a2a83e7d47f5a6fe6307a40f0f3b encountered error "MemberOf placement constraint unsatisfied.". For more information, see the Troubleshooting section of the Amazon ECS Developer Guide.	4570bfa7-8be5-4cb2-8251-b2ec7d97a3eb
September 27, 2023 at 01:45 (UTC+3:00)	service plutomi-service deregistered 2 targets in target-group plutom-pluto-PXPBQHYDOVMS 	8887f006-96c1-4cd2-8ce2-e04dd67e6ce6
September 27, 2023 at 01:45 (UTC+3:00)	(service plutomi-service, taskSet ecs-svc/3590336725212589463) has begun draining connections on 2 tasks.	62fbb7a4-9363-49da-9241-701ff094914d
September 27, 2023 at 01:45 (UTC+3:00)	service plutomi-service deregistered 2 targets in target-group plutom-pluto-PXPBQHYDOVMS 	331c2a2e-23f8-45e3-b039-7a98daf8db99
September 27, 2023 at 01:29 (UTC+3:00)	


- Does ECS retry if it fails to place? If so how long after?
service plutomi-service was unable to place a task because no container instance met all of its requirements. The closest matching container-instance 2811a2a83e7d47f5a6fe6307a40f0f3b encountered error "MemberOf placement constraint unsatisfied.". For more information, see the Troubleshooting section of the Amazon ECS Developer Guide.

- Could it be due to the healthcheck grace period at the service level?

StatusInfo

Health check grace period
60 seconds


- Should just go back to fargate lel!!


 */
