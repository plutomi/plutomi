import * as zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().min(1),
  BASE_WEB_URL: zod.string().min(1),
  ENVIRONMENT: zod.enum(["development", "staging", "production"]),
  AXIOM_DATASET: zod.string().min(1),
  AXIOM_TOKEN: zod.string().min(1),
  AXIOM_ORG_ID: zod.string().min(1),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_WEB_URL: process.env.BASE_WEB_URL,
  ENVIRONMENT: process.env.ENVIRONMENT || "development",
  AXIOM_DATASET: process.env.AXIOM_DATASET,
  AXIOM_TOKEN: process.env.AXIOM_TOKEN,
  AXIOM_ORG_ID: process.env.AXIOM_ORG_ID,
});
