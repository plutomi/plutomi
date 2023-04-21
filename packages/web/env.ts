import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const webEnvSchema = allEnvVariablesSchema.pick({
  NEXT_PUBLIC_BASE_URL: true
});

export const env = parseEnv({ envSchema: webEnvSchema, label: "API" });
