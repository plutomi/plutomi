import * as zod from "zod";

const envSchema = zod.object({
  BASE_WEB_URL: zod.string().min(1),
  // Not needed for now
  //   ENVIRONMENT: zod.enum(["development", "staging", "production"]),
});

export const env = envSchema.parse({
  BASE_WEB_URL: process.env.NEXT_PUBLIC_BASE_URL,
  //   ENVIRONMENT: process.env.ENVIRONMENT || "development",
});
