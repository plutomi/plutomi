import {
  Cluster,
  FargateService,
  ListenerConfig,
  type FargateTaskDefinition,
  Protocol,
} from "aws-cdk-lib/aws-ecs";
import {
  Certificate,
  CertificateValidation,
  type ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import type { FckNatInstanceProvider } from "cdk-fck-nat";
import { Port, SecurityGroup, type Vpc } from "aws-cdk-lib/aws-ec2";
import { Duration, type Stack } from "aws-cdk-lib";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationMultipleTargetGroupsFargateService,
} from "aws-cdk-lib/aws-ecs-patterns";
import { AdjustmentType } from "aws-cdk-lib/aws-applicationautoscaling";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationProtocolVersion,
  ApplicationTargetGroup,
  HealthCheck,
  ListenerAction,
  ListenerCondition,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

type CreateFargateServiceProps = {
  stack: Stack;
  taskDefinition: FargateTaskDefinition;
  vpc: Vpc;
  natGatewayProvider: FckNatInstanceProvider;
};

const serviceName = "plutomi-service";
const loadBalancerName = "plutomi-load-balancer";
const webTargetGroupName = "plutomi-web-target-group";
const apiTargetGroupName = "plutomi-api-target-group";
const clusterName = "plutomi-cluster";
const certificateName = "plutomi-certificate";
const listenerName = "plutomi-listener";

export const createFargateService = ({
  stack,
  taskDefinition,
  vpc,
  natGatewayProvider,
}: CreateFargateServiceProps): FargateService => {
  const cluster = new Cluster(stack, clusterName, {
    clusterName,
    vpc,
  });
  const fargateService = new FargateService(stack, "plutomi-fargate-service", {
    cluster,
    vpcSubnets: {
      subnets: vpc.privateSubnets,
    },
    taskDefinition,
    desiredCount: 2,
    serviceName,
  });

  const loadBalancer = new ApplicationLoadBalancer(stack, loadBalancerName, {
    vpc,
    internetFacing: true,
    loadBalancerName,
  });

  //   loadBalancer.connections.securityGroups.forEach((sg: SecurityGroup) => {
  //     sg. // ! TODO: Add cloudflare IPS @ LB
  //   });

  const listener = loadBalancer.addListener(listenerName, {
    port: 443,
    certificates: [
      new Certificate(stack, certificateName, {
        domainName: `*.plutomi.com`, // Do not use .env.NEXT_PUBLIC_BASE_URL here
        validation: CertificateValidation.fromDns(),
        certificateName,
      }),
    ],
  });

  const defaultHealthCheck: HealthCheck = {
    interval: Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    timeout: Duration.seconds(4),
    path: "/",
  };

  const apiTargetGroup = new ApplicationTargetGroup(stack, apiTargetGroupName, {
    vpc,
    port: 8080,
    protocol: ApplicationProtocol.HTTP,
    targetGroupName: apiTargetGroupName,
    targets: [
      fargateService.loadBalancerTarget({
        containerName: "plutomi-api-container",
        containerPort: 8080,
      }),
    ],
    healthCheck: {
      ...defaultHealthCheck,
      path: "/api/health",
    },
  });

  const webTargetGroup = new ApplicationTargetGroup(stack, webTargetGroupName, {
    vpc,
    port: 3000,
    protocol: ApplicationProtocol.HTTP,
    targetGroupName: webTargetGroupName,
    targets: [
      fargateService.loadBalancerTarget({
        containerName: "plutomi-web-container",
        containerPort: 3000,
      }),
    ],
    healthCheck: defaultHealthCheck,
  });

  listener.addAction(`plutomi-force-api-to-web-action`, {
    action: ListenerAction.forward([webTargetGroup]),
    priority: 10,
    // Force /api/ to redirect to web, which will force a redirect to an API docs page
    conditions: [ListenerCondition.pathPatterns(["/api/"])],
  });

  listener.addAction(`plutomi-api-rule`, {
    action: ListenerAction.forward([apiTargetGroup]),
    priority: 20,
    // Force anything with stuff after /api/* to the actual API
    conditions: [ListenerCondition.pathPatterns(["/api/*"])],
  });

  // Everything else, go to web. A default action is required
  listener.addAction(`plutomi-default action`, {
    action: ListenerAction.forward([webTargetGroup]),
  });

  // Required or else will fail to deploy
  fargateService.node.addDependency(listener);

  // How long it takes to kill a container
  // https://twitter.com/pahudnet/status/1185232660081197056
  const deregistrationDelaySeconds = 5;
  [apiTargetGroup, webTargetGroup].forEach((tg) => {
    tg.setAttribute(
      "deregistration_delay.timeout_seconds",
      deregistrationDelaySeconds.toString()
    );
  });

  // Scaling
  //   const scalingPeriodInSeconds = 60;
  //   const evaluationPeriods = 1;
  //   const DESIRED_RPS_PER_SERVER = 25;

  //   const scaling = fargateService.service.autoScaleTaskCount({
  //     minCapacity: 1,
  //     // Be aware of the connection pooling settings when changing this value
  //     maxCapacity: 10,
  //   });

  // scaling.scaleOnRequestCount("RPS-Scale-Up-Policy", {
  //   requestsPerTarget: DESIRED_RPS_PER_SERVER,
  //   targetGroup: fargateService.targetGroup,
  //   policyName: "RPS-Scale-Up-Policy",
  //   scaleOutCooldown: Duration.seconds(30),
  //   scaleInCooldown: Duration.seconds(180)
  // });

  //   Get the total requests in a 10 second period
  //   const requestsPerMinuteMetric = new Metric({
  //     namespace: "AWS/ApplicationELB",
  //     metricName: "RequestCountPerTarget",
  //     statistic: "Sum",
  //     period: Duration.seconds(scalingPeriodInSeconds),
  //     dimensionsMap: {
  //       // Tells CW which LB and Target Group to get metrics from
  //       TargetGroup: fargateService.targetGroup.targetGroupFullName,
  //       LoadBalancer: fargateService.loadBalancer.loadBalancerFullName,
  //     },
  //   });

  //   scaling.scaleOnMetric("RPS-Scale-Up-Policy", {
  //     evaluationPeriods,
  //     metric: requestsPerMinuteMetric,
  //     scalingSteps: [
  //       {
  //         lower: DESIRED_RPS_PER_SERVER * scalingPeriodInSeconds,
  //         change: 2,
  //       },
  //       {
  //         lower:
  //           DESIRED_RPS_PER_SERVER *
  //           scalingPeriodInSeconds *
  //           // Spike
  //           2,
  //         change: 3,
  //       },
  //     ],
  //     adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
  //   });

  //   scaling.scaleOnMetric("RPS-Scale-Down-Policy", {
  //     evaluationPeriods: 18,
  //     metric: requestsPerMinuteMetric,
  //     scalingSteps: [
  //       {
  //         /**
  //          * TLDR:
  //          * Traffic dropped by 30% for 3 minutes straight -> Scale Down by 1
  //          * Traffic dropped by 70% for 3 minutes straight -> Scale Down by 3
  //          *
  //          * "RequestCountPerTarget <= 1050 for 18 datapoints (every 10 seconds) within 3 minutes"
  //          */
  //         upper:
  //           Math.floor(DESIRED_RPS_PER_SERVER * 0.7) * scalingPeriodInSeconds,
  //         change: -1,
  //       },
  //       {
  //         upper:
  //           Math.floor(DESIRED_RPS_PER_SERVER * 0.3) * scalingPeriodInSeconds,
  //         change: -2,
  //       },
  //     ], // Note that this is a percentage change
  //     adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
  //   });

  const ports = [
    // Outbound HTTPS from tasks
    443,
    //  Outbound MongoDB from tasks - TODO Replace with Private Link in the future
    27017,
  ];

  // Allow outbound traffic from tasks to the internet
  ports.forEach((port) => {
    natGatewayProvider.connections.allowFrom(fargateService, Port.tcp(port));
  });

  return fargateService;
};
