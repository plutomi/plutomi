import * as zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().min(1),
  NEXT_PUBLIC_BASE_URL: zod.string().min(1),
  NEXT_PUBLIC_ENVIRONMENT: zod.enum(["development", "staging", "production"]),
  AXIOM_DATASET: zod.string().min(1),
  AXIOM_TOKEN: zod.string().min(1),
  AXIOM_ORG_ID: zod.string().min(1),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
  AXIOM_DATASET: process.env.AXIOM_DATASET,
  AXIOM_TOKEN: process.env.AXIOM_TOKEN,
  AXIOM_ORG_ID: process.env.AXIOM_ORG_ID,
});
