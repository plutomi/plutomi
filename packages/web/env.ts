import { allEnvVariablesSchema, parseEnv } from "@plutomi/env";

export const env = parseEnv({
  envSchema: allEnvVariablesSchema.pick({
    // ! Make sure that whatever variables you pick here are also added to the Dockerfile
    NEXT_PUBLIC_BASE_URL: true
  }),
  label: "API"
});
