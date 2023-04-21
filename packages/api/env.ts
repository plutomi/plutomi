import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const apiEnvSchema = allEnvVariablesSchema.pick({
  PORT: true,
  NODE_ENV: true,
  DOMAIN: true,
  NEXT_PUBLIC_BASE_URL: true
});

export const env = parseEnv({ envSchema: apiEnvSchema, label: "API" });
