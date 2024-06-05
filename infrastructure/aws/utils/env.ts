import * as zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().min(1),
  BASE_WEB_URL: zod.string().min(1),
  ENVIRONMENT: zod.enum(["development", "staging", "production"]),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_WEB_URL: process.env.BASE_WEB_URL,
  ENVIRONMENT: process.env.ENVIRONMENT || "development",
});
