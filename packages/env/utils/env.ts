/* eslint-disable no-console */

import * as z from "zod";
import { DeploymentEnvironment, NodeEnvironment } from "../consts";
import { awsRegionSchema } from "../customSchemas";

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env var schemas, and when deploying, this is the first
 * point of entry for the app. This way, we can validate all env vars before we do anything else.
 */
export const allEnvVariablesSchema = z.object({
  PORT: z
    .number()
    .int()
    .gte(3000)
    .lte(10000)
    .default(3000)
    // CDK Requires this to be a string in the task definition port mappings because of reasons
    .transform((val) => val.toString()),
  NODE_ENV: z.nativeEnum(NodeEnvironment).default(NodeEnvironment.DEVELOPMENT),
  DEPLOYMENT_ENVIRONMENT: z
    .nativeEnum(DeploymentEnvironment)
    .default(DeploymentEnvironment.DEV),
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
  MONGO_URL: z.string().includes("mongodb+srv://").includes(".mongodb.net"),
  SESSION_PASSWORD_1: z.string().min(100)
});

export const webEnvSchema = allEnvVariablesSchema.pick({
  NEXT_PUBLIC_BASE_URL: true
});

export const apiEnvSchema = allEnvVariablesSchema.pick({
  PORT: true,
  NODE_ENV: true,
  NEXT_PUBLIC_BASE_URL: true,
  DEPLOYMENT_ENVIRONMENT: true,
  MONGO_URL: true,
  SESSION_PASSWORD_1: true
});

export const databaseEnvSchema = allEnvVariablesSchema.pick({
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
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
  CF_HEADER_KEY: process.env.CF_HEADER_KEY as string,
  CF_HEADER_VALUE: process.env.CF_HEADER_VALUE as string,
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID as string,
  AWS_REGION: process.env.AWS_REGION as string,
  ACM_CERTIFICATE_ID: process.env.ACM_CERTIFICATE_ID as string,
  MONGO_URL: process.env.MONGO_URL as string,
  SESSION_PASSWORD_1: process.env.SESSION_PASSWORD_1 as string
};
