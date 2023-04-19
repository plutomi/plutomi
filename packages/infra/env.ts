/* eslint-disable no-console */
import * as z from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const defaultPort = 3000;
const desiredDomain = "plutomi.com";
const localHost = "localhost";
const deploymentEnvironments = ["prod", "stage"] as const;
const nodeEnv = ["development", "production"] as const;

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars, and that
 * place is in infra package when things get built / deployed. Locally, we can use .env files.
 *
 */
const envSchema = z
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
    DOMAIN: z.enum([localHost, desiredDomain]).default(localHost),
    BASE_URL: z.string().url().default(`http://${localHost}:${defaultPort}`),
    API_URL: z.string().url().default(`http://${localHost}:${defaultPort}/api`),
    // WAF Will block requests that don't include this header
    CF_HEADER_KEY: z.literal("cf-custom-header").default("cf-custom-header"),
    CF_HEADER_VALUE: z.string()
  })
  .refine((data) => {
    const { DOMAIN, BASE_URL } = data;
    if (!BASE_URL.includes(DOMAIN)) {
      return {
        message: "BASE_URL must include DOMAIN"
      };
    }

    return data;
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}

// Actual variables used in the infra package and passed on to others when deploying.
export const allEnvVariables = parsed.data;

// This schema is imported into other packages, and they .pick() the variables they need.
