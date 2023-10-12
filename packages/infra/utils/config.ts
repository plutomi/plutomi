import { Duration } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";

/**
 * ! DO NOT CHANGE THE INSTANCE TYPE WITH THE OTHER VALUES AT THE SAME TIME
 * ! DO NOT CHANGE THE INSTANCE TYPE WITH THE OTHER VALUES AT THE SAME TIME
 * ! DO NOT CHANGE THE INSTANCE TYPE WITH THE OTHER VALUES AT THE SAME TIME
 * ! DO NOT CHANGE THE INSTANCE TYPE WITH THE OTHER VALUES AT THE SAME TIME
 *
 * THIS WILL CAUSE AN OUTAGE
 *
 * ECS will try to place the tasks but the ASG will kill the old ones while the new instance is initializing.
 *
 * Here is what happens:
2 Tasks are running on 1 instance
ECS starts up the 2 new tasks on the old instance (total 4) because it has room
New instance starts up, still initializing
New tasks are running & stable on the old instance
Old tasks are killed on old instance
New instance finishes initializing
Old instance is killed due to ECS tasks healthy, but LB not healthy
Downtime!
New instance is healthy
ECS starts tasks on those instances
 */
export const MIN_NUMBER_OF_INSTANCES = 2;
export const MAX_NUMBER_OF_INSTANCES = 4;
/**
 * https://instances.vantage.sh/aws/ec2/t4g.nano?region=us-east-1&os=linux&cost_duration=monthly&reserved_term=Standard.noUpfront
 * 2vCPUs, 0.5GB RAM
 */
export const INSTANCE_TYPE = InstanceType.of(
  InstanceClass.T4G,
  InstanceSize.NANO
);

// Ensure these values fit within the instance type
// Or might cause a crash on deployments due to running out of resources
// export const CONTAINER_CPU = 400;
// export const CONTAINER_MEMORY_LIMIT = 800;
// export const NUMBER_OF_CONTAINERS_PER_INSTANCE = 4;
export const CONTAINER_CPU = 1600;
export const CONTAINER_MEMORY_LIMIT = 420;
export const NUMBER_OF_CONTAINERS_PER_INSTANCE = 1;
export const HEALTH_CHECK_PATH = "/api/health";
export const HEALTH_CHECK_THRESHOLD_SECONDS = 5;
export const HEALTHY_THRESHOLD_COUNT = 2;
