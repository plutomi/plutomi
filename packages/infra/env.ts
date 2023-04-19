/* eslint-disable no-console */
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const defaultPort = 3000;
const desiredDomain = "plutomi.com";
const deploymentEnvironments = ["prod", "stage"] as const;
const nodeEnv = ["development", "production"] as const;

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars, and that
 * place is in infra package when things get built / deployed. Locally, we can use .env files.
 */
const allEnvVariablesSchema = z
  .object({
    PORT: z.coerce
      .number()
      .int()
      .positive()
      .gte(1024)
      .lte(65535)
      .default(defaultPort),
    NODE_ENV: z.enum(nodeEnv).default("development"),
    DEPLOYMENT_ENVIRONMENT: z.enum(deploymentEnvironments),
    // WAF Will block requests that don't include this header
    CF_HEADER_KEY: z.literal("cf-custom-header").default("cf-custom-header"),
    CF_HEADER_VALUE: z.string()
  })
  .transform((env) => {
    const isLocal = env.NODE_ENV === "development";
    const isStage = env.DEPLOYMENT_ENVIRONMENT === "stage";
    let DOMAIN = isLocal ? "localhost" : desiredDomain;
    if (isStage) {
      DOMAIN = `stage.${DOMAIN}`;
    }

    const BASE_URL = `http${isLocal ? "" : "s"}://${DOMAIN}`;
    const API_URL = `${BASE_URL}/api`;

    return { ...env, BASE_URL, DOMAIN, API_URL };
  });

const parsed = allEnvVariablesSchema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}

// Actual variables used in the infra package and passed on to others when deploying.
export const infraEnvVariables = parsed.data;

// Schema used across other packages, you would .pick the ones that are needed in each package's env.ts
export { parsed as allEnvVariablesSchema };
