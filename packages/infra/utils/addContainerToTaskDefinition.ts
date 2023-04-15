import {
  type ContainerDefinition,
  type TaskDefinition,
  AwsLogDriver,
  ContainerImage
} from "aws-cdk-lib/aws-ecs";
import { allEnvVariables } from "../env";

type AddContainerToTaskDefinitionProps = {
  taskDefinition: TaskDefinition;
};

export const addContainerToTaskDefinition = ({
  taskDefinition
}: AddContainerToTaskDefinitionProps): ContainerDefinition => {
  const container = taskDefinition.addContainer(
    "plutomi-api-fargate-container",
    {
      // Get the local docker image (@root), build and deploy it
      image: ContainerImage.fromAsset(".", {
        // ! Must match the ARGs in the docker file for NextJS!
        buildArgs: {
          NEXT_PUBLIC_BASE_URL: allEnvVariables.BASE_URL
        }
      }),

      logging: new AwsLogDriver({
        streamPrefix: "plutomi-api-fargate"
      }),
      environment: allEnvVariables as unknown as Record<string, string>
    }
  );

  return container;
};
