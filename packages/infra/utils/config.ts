import { Duration } from "aws-cdk-lib";
import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";

export const MIN_NUMBER_OF_INSTANCES = 1;
export const MAX_NUMBER_OF_INSTANCES = 2;
/**
 * https://instances.vantage.sh/aws/ec2/t4g.nano?region=us-east-1&os=linux&cost_duration=monthly&reserved_term=Standard.noUpfront
 * 2vCPUs, 0.5GB RAM
 */
export const INSTANCE_TYPE = InstanceType.of(
  InstanceClass.C7G,
  // TODO: Temp setting this to a high value to test
  //
  InstanceSize.XLARGE
);

// Ensure these values fit within the instance type
export const CONTAINER_CPU = 400;
export const CONTAINER_MEMORY_LIMIT = 800;
export const NUMBER_OF_CONTAINERS_PER_INSTANCE = 2;
export const HEALTH_CHECK_PATH = "/api/health";
export const HEALTH_CHECK_THRESHOLD_SECONDS = 5;
export const HEALTHY_THRESHOLD_COUNT = 2;
