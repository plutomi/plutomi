import {
  AmiHardwareType,
  AsgCapacityProvider,
  Cluster,
  EcsOptimizedImage,
  type FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import { Port, SubnetType, UserData, type Vpc } from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { env } from "./env";
import {
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

  const autoscalingGroup = cluster.addCapacity(capacityProviderName, {
    instanceType: INSTANCE_TYPE,
    machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.ARM),
    minCapacity: MIN_NUMBER_OF_INSTANCES,
    maxCapacity: MAX_NUMBER_OF_INSTANCES,
    vpcSubnets: {
      // Ensure that our instances are in a private subnet
      subnetType: SubnetType.PRIVATE_WITH_EGRESS
    }
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
    loadBalancerName
  });

  // --- Autoscaling ---
  const deregistrationDelaySeconds = 5;
  ec2Service.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    deregistrationDelaySeconds.toString()
  );

  // Health Checks
  ec2Service.targetGroup.configureHealthCheck({
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(4),
    path: "/api/health"
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
