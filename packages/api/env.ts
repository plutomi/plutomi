import { allEnvVariables } from "@plutomi/infra";

export const apiEnvSchema = allEnvVariables.pick({
  PORT: true,
  NODE_ENV: true
  // Add any other environment variables needed for API
});
