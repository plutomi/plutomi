import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().gte(1024).lte(65535),
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
