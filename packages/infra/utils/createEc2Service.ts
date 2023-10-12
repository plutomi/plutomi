import {
  AmiHardwareType,
  AsgCapacityProvider,
  Cluster,
  EcsOptimizedImage,
  MachineImageType,
  PlacementConstraint,
  PlacementStrategy,
  type FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import {
  LaunchTemplate,
  Port,
  SubnetType,
  UserData,
  type Vpc
} from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  AutoScalingGroup,
  HealthCheck,
  TerminationPolicy,
  UpdatePolicy
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
const launchTemplateName = "plutomi-launch-template";
// This needs to be unique in some deployment use cases
const autoScalingGroupName = "plutomi-autoscaling-group";

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

  const autoScalingGroup = new AutoScalingGroup(stack, autoScalingGroupName, {
    vpc,
    autoScalingGroupName,
    instanceType: INSTANCE_TYPE,
    machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.ARM),
    minCapacity: MIN_NUMBER_OF_INSTANCES,
    maxCapacity: MAX_NUMBER_OF_INSTANCES,
    defaultInstanceWarmup: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS),
    updatePolicy: UpdatePolicy.rollingUpdate(),
    // Only allow outbound through NAT Gateway
    allowAllOutbound: false
  });

  // https://stackoverflow.com/questions/36523282/aws-ecs-error-when-running-task-no-container-instances-were-found-in-your-clust
  autoScalingGroup.addUserData(
    "#!/bin/bash",
    `echo ECS_CLUSTER=${clusterName} >> /etc/ecs/ecs.config`,
    "sudo yum update -y",
    "sudo yum clean all"
  );

  const capacityProvider = new AsgCapacityProvider(
    stack,
    capacityProviderName,
    {
      capacityProviderName,
      autoScalingGroup,
      targetCapacityPercent: 100
    }
  );

  cluster.addAsgCapacityProvider(capacityProvider);

  const ec2Service = new ApplicationLoadBalancedEc2Service(stack, serviceName, {
    cluster,
    certificate,
    taskDefinition,
    // LB is public, instances are in a private subnet
    publicLoadBalancer: true,
    serviceName,
    loadBalancerName,
    desiredCount: MIN_NUMBER_OF_INSTANCES * NUMBER_OF_CONTAINERS_PER_INSTANCE,
    minHealthyPercent: 50,
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

  // Allow our LB to connect to our instances on any port since our containers can be running on any port
  const AWS_EPHEMERAL_PORT_RANGE = Port.tcpRange(1024, 65535);
  ec2Service.loadBalancer.connections.allowTo(
    autoScalingGroup,
    AWS_EPHEMERAL_PORT_RANGE
  );

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
    natGatewayProvider.connections.allowFrom(autoScalingGroup, Port.tcp(port));
  });

  return ec2Service;
};
