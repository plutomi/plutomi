/* eslint-disable no-console */
import * as z from "zod";
import { DeploymentEnvironment, NodeEnvironment } from "./consts";

const defaultPort = 3000;
const localHost = "localhost";

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars schemas.
 */
const allEnvVariablesSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .gte(1024)
    .lte(65535)
    .default(defaultPort),
  NODE_ENV: z.nativeEnum(NodeEnvironment).default(NodeEnvironment.DEVELOPMENT),
  DEPLOYMENT_ENVIRONMENT: z
    .nativeEnum(DeploymentEnvironment)
    .default(DeploymentEnvironment.DEV),
  DOMAIN: z.string().default(localHost),
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url()
    .default(`http://${localHost}:${defaultPort}`),
  // WAF Will block requests that don't include this header
  CF_HEADER_KEY: z.string(),
  CF_HEADER_VALUE: z
    .string()
    .min(50, "Value must be at least 50 characters long")
});

export const apiEnvSchema = allEnvVariablesSchema.pick({
  PORT: true,
  NODE_ENV: true,
  DOMAIN: true,
  NEXT_PUBLIC_BASE_URL: true
});

export const webEnvSchema = allEnvVariablesSchema.pick({
  DOMAIN: true,
  NEXT_PUBLIC_BASE_URL: true
});

// When deploying with CDK, we need all the env vars
export const infraEnvSchema = allEnvVariablesSchema;
