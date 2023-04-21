import { apiEnvSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({ envSchema: apiEnvSchema, label: "API" });
