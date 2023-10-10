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
  HealthCheck,
  TerminationPolicy
} from "aws-cdk-lib/aws-autoscaling";
import { env } from "./env";
import {
  HEALTHY_THRESHOLD_COUNT,
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

  // ! TODO: Add placement strategy to only add new tasks on new instances

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
    defaultInstanceWarmup: Duration.seconds(0),

    /**
     * ! This is required because what is happening is the following:
     * 2 Tasks are running on 1 instance
     * ECS starts up the 2 new tasks on the old instance (total 4) because it has room
     * New instance starts up, still initializing
     * New tasks are running & stable on the old instance
     * Old tasks are killed on old instance
     * New instance finishes initializing
     * Old instance is killed due to ECS tasks healthy, but LB not healthy
     * Downtime
     * New instance is healthy
     * ECS starts tasks on those instances
     *
     */
    healthCheck: HealthCheck.elb({
      grace: Duration.seconds(
        HEALTH_CHECK_THRESHOLD_SECONDS * HEALTHY_THRESHOLD_COUNT
      )
    })
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

    /**
     * LB is public, instances are in a private subnet
     */
    publicLoadBalancer: true,
    serviceName,
    loadBalancerName,
    desiredCount: MIN_NUMBER_OF_INSTANCES * NUMBER_OF_CONTAINERS_PER_INSTANCE,
    // Note: Ensure that the instance type can handle a 200% increase in tasks if only running one
    // TODO: or find a way to only deploy new tasks on the new instances?
    minHealthyPercent: 100,
    maxHealthyPercent: 200
  });

  ec2Service.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    String(HEALTH_CHECK_THRESHOLD_SECONDS)
  );

  // Health Checks
  ec2Service.targetGroup.configureHealthCheck({
    healthyThresholdCount: HEALTHY_THRESHOLD_COUNT,
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
