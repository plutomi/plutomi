import { webEnvSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({ envSchema: webEnvSchema, label: "API" });
