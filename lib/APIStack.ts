import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

// TODO make these variables env vars
export default class APIStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM inline role - the service principal is required
    const taskRole = new iam.Role(this, "plutomi-fargate-api-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-fargate-api-definition",
      {
        taskRole: taskRole,
        executionRole: taskRole,
      }
    );

    // Import a local docker image and set up logger
    const container = taskDefinition.addContainer(
      "plutomi-fargate-api-container",
      {
        image: ecs.ContainerImage.fromRegistry(
          "public.ecr.aws/w5f2q5z8/nextjs-on-fargate:latest"
        ),
        logging: new ecs.AwsLogDriver({
          streamPrefix: "plutomi-fargate-api-log-prefix",
        }),
      }
    );

    container.addPortMappings({
      containerPort: 3000, // NextJS default!
      hostPort: 3000, // NextJS default!
      protocol: ecs.Protocol.TCP,
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-fargate-api-cluster");

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "PlutomiFargateAPI",
      {
        cluster: cluster, // Required
        cpu: 256, // Default is 256
        desiredCount: 2, // Default is 1
        taskDefinition: taskDefinition,
        memoryLimitMiB: 512, // Default is 512
        publicLoadBalancer: true, // Default is false
      }
    );
  }
}
