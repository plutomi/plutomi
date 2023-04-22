/* eslint-disable no-console */
import * as z from "zod";
import { DeploymentEnvironment, NodeEnvironment } from "./consts";
import { awsRegionSchema, portSchema } from "./customSchemas";

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars schemas.
 */
export const allEnvVariablesSchema = z.object({
  PORT: portSchema,
  NODE_ENV: z.nativeEnum(NodeEnvironment),
  DEPLOYMENT_ENVIRONMENT: z.nativeEnum(DeploymentEnvironment),
  DOMAIN: z.string(), // Used by infra to setup DNS stuff
  NEXT_PUBLIC_BASE_URL: z.string().url(), // Used by API and web
  // WAF Will block requests that don't include this header
  CF_HEADER_KEY: z.string(),
  CF_HEADER_VALUE: z
    .string()
    .min(50, "Value must be at least 50 characters long"),
  AWS_ACCOUNT_ID: z.string(),
  AWS_REGION: awsRegionSchema
});
