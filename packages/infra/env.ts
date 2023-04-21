import { infraEnvSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({ envSchema: infraEnvSchema, label: "INFRA" });
