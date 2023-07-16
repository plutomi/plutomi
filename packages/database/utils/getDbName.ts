import { DeploymentEnvironment } from "@plutomi/env";
import { env } from "./env";

export const getDatabaseName = () => {
  // Everything is in one cluster because I'm broke ATM :D
  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.DEV) {
    return "plutomi-local";
  }

  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.STAGE) {
    return "plutomi-stage";
  }

  if (env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT === DeploymentEnvironment.PROD) {
    return "plutomi-prod";
  }

  throw new Error(
    "Unable to get the database name due to invalid deployment environment"
  );
};
