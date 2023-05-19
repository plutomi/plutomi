/* eslint-disable no-console */

import * as z from "zod";
import { DeploymentEnvironment, NodeEnvironment } from "./consts";
import { awsRegionSchema, portSchema } from "./customSchemas";

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env var schemas, and when deploying, this is the first
 * point of entry for the app. This way, we can validate all env vars before we do anything else.
 */
export const allEnvVariablesSchema = z.object({
  PORT: portSchema,
  NODE_ENV: z.nativeEnum(NodeEnvironment),
  DEPLOYMENT_ENVIRONMENT: z.nativeEnum(DeploymentEnvironment),
  DOMAIN: z.string(), // Used by infra to setup DNS stuff
  // ! For NextJS, make sure to add to packages/web/env.ts as well as the Dockerfile
  NEXT_PUBLIC_BASE_URL: z.string().url(), // Used by API and web
  // WAF Will block requests that don't include this header
  CF_HEADER_KEY: z.string(),
  CF_HEADER_VALUE: z
    .string()
    .min(50, "Value must be at least 50 characters long"),
  AWS_ACCOUNT_ID: z.string(),
  AWS_REGION: awsRegionSchema,
  ACM_CERTIFICATE_ID: z.string().uuid(),
  MONGO_URL: z.string().includes("mongodb+srv://").includes(".mongodb.net")
});

export const webEnvSchema = allEnvVariablesSchema.pick({
  NEXT_PUBLIC_BASE_URL: true
});

export const apiEnvSchema = allEnvVariablesSchema.pick({
  PORT: true,
  NODE_ENV: true,
  NEXT_PUBLIC_BASE_URL: true,
  DEPLOYMENT_ENVIRONMENT: true,
  MONGO_URL: true
});

// We are overriding these types because they will get validated using the schema above.
// We have to "destructure" these because NextJS won't allow process.env destructuring.
export const processEnv: z.infer<typeof allEnvVariablesSchema> = {
  PORT: process.env.PORT as string,
  NODE_ENV: process.env.NODE_ENV as NodeEnvironment,
  DEPLOYMENT_ENVIRONMENT: process.env
    .DEPLOYMENT_ENVIRONMENT as DeploymentEnvironment,
  DOMAIN: process.env.DOMAIN as string,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
  CF_HEADER_KEY: process.env.CF_HEADER_KEY as string,
  CF_HEADER_VALUE: process.env.CF_HEADER_VALUE as string,
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID as string,
  AWS_REGION: process.env.AWS_REGION as string,
  ACM_CERTIFICATE_ID: process.env.ACM_CERTIFICATE_ID as string,
  MONGO_URL: process.env.MONGO_URL as string
};
