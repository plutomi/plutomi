/* eslint-disable no-console */
import type { ZodTypeAny, z } from "zod";

type ParseEnvProps<T> = {
  /**
   * The schema to use for  parsing the environment variables.   *
   */
  envSchema: T;
  label: string;
};

export const parseEnv = <T extends ZodTypeAny>({
  envSchema,
  label
}: ParseEnvProps<T>): z.infer<T> => {
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
