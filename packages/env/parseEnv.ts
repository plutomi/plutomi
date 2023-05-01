/* eslint-disable no-console */
import type { ZodTypeAny, z } from "zod";
import type { SchemaEnvironment } from "./consts";
import { processEnv } from "./env";

type ParseEnvProps<T> = {
  /**
   * The schema to use for  parsing the environment variables.   *
   */
  envSchema: T;
  schemaEnvironment: SchemaEnvironment;
};

export const parseEnv = <T extends ZodTypeAny>({
  envSchema,
  schemaEnvironment
}: ParseEnvProps<T>): z.infer<T> => {
  const parsed = envSchema.safeParse(processEnv);

  const errorMessage = `❌ Invalid environment variables in ${schemaEnvironment}:`;
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      console.error(issue);
      console.log(parsed.error.flatten().fieldErrors);
      console.error(errorMessage);
    });

    throw new Error(errorMessage);
  }

  // Return the parsed data
  return parsed.data;
};
