import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecr from "@aws-cdk/aws-ecr";
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

    // Add policies
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess") // TODO FIX THIS!!!!
    );

    // Define a fargate task with the newly created execution and task roles
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "plutomi-fargate-api-definition",
      {
        taskRole: taskRole,
        executionRole: taskRole,
      }
    );

    // For private ECR repositories, you must set this or you'll receive this error
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "plutomi-fargate-api-repository",
      "plutomi" 
    );

    const image = ecs.ContainerImage.fromEcrRepository(
      repository,
      "latest" 
    );

    const container = taskDefinition.addContainer(
      "plutomi-fargate-api-container",
      {
        image: image,
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

    const vpc = new ec2.Vpc(this, "plutomi-fargate-api-vpc", {
      maxAzs: 2,
      natGateways: 1,
      gatewayEndpoints: {},
    });

    // Create the cluster
    const cluster = new ecs.Cluster(this, "plutomi-fargate-api-cluster", {
      vpc,
    });

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
