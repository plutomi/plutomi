import {
  AmiHardwareType,
  AsgCapacityProvider,
  Cluster,
  EcsOptimizedImage,
  type FargateTaskDefinition
} from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import {
  LaunchTemplate,
  Port,
  SecurityGroup,
  UserData,
  type Vpc
} from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import {
  HEALTHY_THRESHOLD_COUNT,
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_THRESHOLD_SECONDS,
  INSTANCE_TYPE,
  MAX_NUMBER_OF_INSTANCES,
  MIN_NUMBER_OF_INSTANCES,
  NUMBER_OF_CONTAINERS_PER_INSTANCE
} from "./config";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

type CreatePlutomiServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

const clusterName = "plutomi-cluster";
const serviceName = "plutomi-service";
const loadBalancerName = "plutomi-load-balancer";
// This needs to be unique due to Replacing Update
const autoScalingGroupName = "plutomi-autoscaling-group";
const capacityProviderName = "plutomi-capacity-provider";
const launchTemplateName = "plutomi-launch-template";
const launchTemplateRoleName = "plutomi-launch-template-role";
const ec2SecurityGroupName = "plutomi-ec2-security-group";

export const createPlutomiService = ({
  stack,
  taskDefinition,
  certificate,
  vpc,
  natGatewayProvider
}: CreatePlutomiServiceProps): ApplicationLoadBalancedEc2Service => {
  const cluster = new Cluster(stack, clusterName, {
    vpc,
    clusterName
  });

  const userData = UserData.forLinux();
  userData.addCommands(
    // https://stackoverflow.com/questions/36523282/aws-ecs-error-when-running-task-no-container-instances-were-found-in-your-clust
    "#!/bin/bash",
    `echo ECS_CLUSTER=${clusterName} >> /etc/ecs/ecs.config`,
    "sudo yum update -y",
    "sudo yum clean all"
  );

  const ec2SecurityGroup = new SecurityGroup(stack, ec2SecurityGroupName, {
    vpc,
    allowAllOutbound: false,
    // Only allow outbound through NAT Gateway - extra check
    securityGroupName: ec2SecurityGroupName
  });

  const launchTemplate = new LaunchTemplate(stack, launchTemplateName, {
    // This is required due to launch configurations (defined in ASGs) being deprecated
    instanceType: INSTANCE_TYPE,
    machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.ARM),
    userData,
    launchTemplateName,
    role: new Role(stack, launchTemplateRoleName, {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      roleName: launchTemplateRoleName
    }),
    securityGroup: ec2SecurityGroup
  });

  const autoScalingGroup = new AutoScalingGroup(stack, autoScalingGroupName, {
    vpc,
    autoScalingGroupName,
    launchTemplate,
    minCapacity: MIN_NUMBER_OF_INSTANCES,
    // desiredCapacity: MIN_NUMBER_OF_INSTANCES, - Don't set this
    maxCapacity: MAX_NUMBER_OF_INSTANCES,
    defaultInstanceWarmup: Duration.seconds(HEALTH_CHECK_THRESHOLD_SECONDS)
  });

  const capacityProvider = new AsgCapacityProvider(
    stack,
    capacityProviderName,
    {
      capacityProviderName,
      autoScalingGroup
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
    interval: Duration.seconds(20),
    timeout: Duration.seconds(10),
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
