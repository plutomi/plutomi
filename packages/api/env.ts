import { envSchema } from "@plutomi/infra";

export const env = envSchema
  .pick({
    PORT: true,
    NODE_ENV: true,
    BASE_URL: true,
    API_URL: true,
    DEPLOYMENT_ENVIRONMENT: true
  })
  .parse(process.env);
