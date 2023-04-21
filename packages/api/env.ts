import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({
  envSchema: allEnvVariablesSchema.pick({
    PORT: true,
    NODE_ENV: true,
    DOMAIN: true,
    NEXT_PUBLIC_BASE_URL: true
  }),
  label: "API"
});
