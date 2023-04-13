import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().gte(1024).lte(65535),
  NODE_ENV: z.enum(["development", "production"])
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error("\n❌ Invalid environment variable:");
    console.error(issue);
  });

  process.exit(1);
}

export const env = parsed.data;
