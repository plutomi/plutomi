import * as zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().min(1),
  NEXT_PUBLIC_BASE_URL: zod.string().min(1),
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: zod.enum([
    "development",
    "staging",
    "production",
  ]),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT:
    process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT || "development",
});
