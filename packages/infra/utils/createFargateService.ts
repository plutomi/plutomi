import {
  TaskDefinition,
  type FargateTaskDefinition,
  Compatibility,
  ContainerImage,
  AwsLogDriver,
  Cluster
} from "aws-cdk-lib/aws-ecs";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  // InstanceClass,
  // InstanceSize,
  // InstanceType,
  Port,
  type Vpc
} from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { env } from "./env";

type CreateFargateServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  certificate: ICertificate;
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

// const serviceName = "plutomi-service";
// const loadBalancerName = "plutomi-load-balancer";

export const createFargateService = ({
  stack,
  // taskDefinition,
  certificate,
  vpc,
  natGatewayProvider
}: CreateFargateServiceProps): ApplicationLoadBalancedEc2Service => {
  // const fargateService = new ApplicationLoadBalancedFargateService(
  //   stack,
  //   serviceName,
  //   {
  //     vpc,
  //     certificate,
  //     taskDefinition,
  //     // The load balancer will be public, but our tasks will not.
  //     // Outbound traffic for the tasks will be provided by the NAT Gateway
  // assignPublicIp: false,
  // publicLoadBalancer: true,
  // taskSubnets: {
  //   // Ensure private subnets are used for tasks
  //   subnets: vpc.privateSubnets
  // },
  // desiredCount: 1,
  //     serviceName,
  //     loadBalancerName
  //   }
  // );

  // How long it takes to kill a container
  // https://twitter.com/pahudnet/status/1185232660081197056
  // const deregistrationDelaySeconds = 5;
  // fargateService.targetGroup.setAttribute(
  //   "deregistration_delay.timeout_seconds",
  //   deregistrationDelaySeconds.toString()
  // );

  // // Health Checks
  // fargateService.targetGroup.configureHealthCheck({
  //   interval: Duration.seconds(5),
  //   healthyThresholdCount: 2,
  //   unhealthyThresholdCount: 2,
  //   timeout: Duration.seconds(4),
  //   path: "/api/health"
  // });

  const ec2Definition = new TaskDefinition(stack, "Task", {
    compatibility: Compatibility.EC2
  });

  ec2Definition.addContainer("pt-name", {
    portMappings: [
      {
        containerPort: Number(env.PORT)
      }
    ],
    image: ContainerImage.fromAsset("../../", {
      // Get the local docker image (@root), build and deploy it
      // ! Must match the ARGs in the docker file for NextJS!
      buildArgs: {
        NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL
      }
    }),
    logging: new AwsLogDriver({
      streamPrefix: "ec2-example"
    }),
    memoryLimitMiB: 512,
    cpu: 2048,
    environment: env as unknown as Record<string, string>
  });

  const cluster = new Cluster(stack, "Ec2-Cluster", {
    vpc
  });

  // Add capacity to it
  cluster.addCapacity("DefaultAutoScalingGroupCapacity", {
    instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
    minCapacity: 1,
    maxCapacity: 10
  });

  const customEc2 = new ApplicationLoadBalancedEc2Service(
    stack,
    "app-service",
    {
      cluster,
      certificate,
      // One container per server
      desiredCount: 1,
      serviceName: "cmsservice",
      taskDefinition: ec2Definition,
      publicLoadBalancer: true,
      taskImageOptions: {
        
      }
    }
  );

  const deregistrationDelaySeconds = 5;
  customEc2.targetGroup.setAttribute(
    "deregistration_delay.timeout_seconds",
    deregistrationDelaySeconds.toString()
  );

  // Health Checks
  customEc2.targetGroup.configureHealthCheck({
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(4),
    path: "/api/health"
  });

  // Scaling
  const scalingPeriodInSeconds = 60;
  const evaluationPeriods = 1;
  const DESIRED_RPS_PER_SERVER = 25;

  const scaling = customEc2.service.autoScaleTaskCount({
    minCapacity: 1,
    // Be aware of the connection pooling settings when changing this value
    maxCapacity: 10
  });

  // scaling.scaleOnRequestCount("RPS-Scale-Up-Policy", {
  //   requestsPerTarget: DESIRED_RPS_PER_SERVER,
  //   targetGroup: customEc2.targetGroup,
  //   policyName: "RPS-Scale-Up-Policy",
  //   scaleOutCooldown: Duration.seconds(30),
  //   scaleInCooldown: Duration.seconds(180)
  // });

  //   Get the total requests in a 10 second period
  const requestsPerMinuteMetric = new Metric({
    namespace: "AWS/ApplicationELB",
    metricName: "RequestCountPerTarget",
    statistic: "Sum",
    period: Duration.seconds(scalingPeriodInSeconds),
    dimensionsMap: {
      // Tells CW which LB and Target Group to get metrics from
      TargetGroup: customEc2.targetGroup.targetGroupFullName,
      LoadBalancer: customEc2.loadBalancer.loadBalancerFullName
    }
  });

  scaling.scaleOnMetric("RPS-Scale-Up-Policy", {
    evaluationPeriods,
    metric: requestsPerMinuteMetric,
    scalingSteps: [
      {
        lower: DESIRED_RPS_PER_SERVER * scalingPeriodInSeconds,
        change: 2
      },
      {
        lower:
          DESIRED_RPS_PER_SERVER *
          scalingPeriodInSeconds *
          // Spike
          2,
        change: 3
      }
    ],
    adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  });

  // scaling.scaleOnMetric("RPS-Scale-Down-Policy", {
  //   evaluationPeriods: 18,
  //   metric: requestsPerMinuteMetric,
  //   scalingSteps: [
  //     {
  //       /**
  //        * TLDR:
  //        * Traffic dropped by 30% for 3 minutes straight -> Scale Down by 1
  //        * Traffic dropped by 70% for 3 minutes straight -> Scale Down by 3
  //        *
  //        * "RequestCountPerTarget <= 1050 for 18 datapoints (every 10 seconds) within 3 minutes"
  //        */
  //       upper:
  //         Math.floor(DESIRED_RPS_PER_SERVER * 0.7) * scalingPeriodInSeconds,
  //       change: -1
  //     },
  //     {
  //       upper:
  //         Math.floor(DESIRED_RPS_PER_SERVER * 0.3) * scalingPeriodInSeconds,
  //       change: -3
  //     }
  //   ], // Note that this is a percentage change
  //   adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY
  // });

  const ports = [
    // Outbound HTTPS from tasks
    443,
    // Outbound MongoDB from tasks
    27017
  ];

  // Allow outbound traffic from tasks to the internet
  // TODO: Mongo PrivateLink
  ports.forEach((port) => {
    natGatewayProvider.connections.allowFrom(customEc2.service, Port.tcp(port));
  });

  return customEc2;
};
