import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({
  envSchema: allEnvVariablesSchema,
  label: "INFRA"
});
