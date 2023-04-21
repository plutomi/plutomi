/* eslint-disable no-console */
import type { ZodSchema } from "zod";

type ParseEnvProps = {
  envSchema: ZodSchema<any>;
  label: string;
};

export const parseEnv = ({ envSchema, label }: ParseEnvProps) => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      console.error(`\n❌ Invalid environment variable in ${label}:`);
      console.error(issue);
    });

    process.exit(1);
  }

  // Return the parsed data
  return parsed.data;
};
