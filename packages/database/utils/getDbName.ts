import { DeploymentEnvironment } from "@plutomi/env";
import { env } from "./env";

// TODO: Change DB Names to match deployment environment
export const getDatabaseName = () => {
  // Everything is in one cluster because I'm broke ATM :D
  if (
    env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.DEVELOPMENT
  ) {
    return "plutomi-local";
  }

  if (
    env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.STAGING
  ) {
    return "plutomi-stage";
  }

  if (
    env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.PRODUCTION
  ) {
    return "plutomi-prod";
  }

  throw new Error(
    "Unable to get the database name due to invalid deployment environment"
  );
};
