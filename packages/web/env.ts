import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({
  envSchema: allEnvVariablesSchema.pick({
    NEXT_PUBLIC_BASE_URL: true
  }),
  label: "API"
});
