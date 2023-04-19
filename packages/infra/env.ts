/* eslint-disable no-console */
import * as z from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const defaultPort = 3000;
const desiredDomain = "plutomi.com";
const localHost = "localhost";
const deploymentEnvironments = ["prod", "stage", "dev"] as const;
const nodeEnv = ["development", "production"] as const;

/**
 * All environment variables in the app. Each package then picks the ones it needs.
 * The reason we do this is so that we can have a single source of truth for all env vars, and that
 * place is in infra package when things get built / deployed. Locally, we can use .env files.
 *
 *  This schema is imported into other packages, and they .pick() the variables they need.
 */
export const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .gte(1024)
    .lte(65535)
    .default(defaultPort),
  NODE_ENV: z.enum(nodeEnv).default("development"),
  DEPLOYMENT_ENVIRONMENT: z.enum(deploymentEnvironments).default("dev"),
  DOMAIN: z.enum([localHost, desiredDomain]).default(localHost),
  BASE_URL: z.string().url().default(`http://${localHost}:${defaultPort}`),
  API_URL: z.string().url().default(`http://${localHost}:${defaultPort}/api`),
  // WAF Will block requests that don't include this header
  CF_HEADER_KEY: z.literal("cf-custom-header"),
  CF_HEADER_VALUE: z
    .string()
    .min(50, "Value must be at least 50 characters long")
});

// Extra validation
envSchema
  .refine((data) => !data.BASE_URL.includes(data.DOMAIN), {
    message: "BASE_URL must include the domain"
  })
  .refine((data) => !data.API_URL.includes(data.DOMAIN), {
    message: "API_URL must include the domain"
  })
  .refine((data) => !data.API_URL.includes(data.BASE_URL), {
    message: "API_URL must include the BASE_URL"
  })
  .refine(
    (data) =>
      data.DEPLOYMENT_ENVIRONMENT !== "dev" && data.DOMAIN !== desiredDomain,
    {
      message: "DOMAIN must be set to the desiredDomain in prod and stage"
    }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}

// Actual variables used in the infra package and passed on to others when deploying
export const allEnvVariables = parsed.data;
