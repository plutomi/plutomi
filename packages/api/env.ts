import { allEnvVariablesSchema } from "@plutomi/infra";

export const apiEnvSchema = allEnvVariablesSchema.pick({
  PORT: true,
  NODE_ENV: true
  // Add any other environment variables needed for API
});
