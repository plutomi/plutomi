import type { ContainerDefinition } from "aws-cdk-lib/aws-ecs";
import { allEnvVariables } from "../env";

type AddContainerPortMappingsProps = {
  container: ContainerDefinition;
};

export const addContainerPortMappings = ({
  container
}: AddContainerPortMappingsProps) => {
  container.addPortMappings({
    containerPort: allEnvVariables.PORT,
    hostPort: allEnvVariables.PORT
  });
};
