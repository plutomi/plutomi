/* eslint-disable no-console */
import type { ZodTypeAny, z } from "zod";
import { SchemaEnvironment } from "../consts";
import { processEnv } from "./env";

type ParseEnvProps<T> = {
  /**
   * The schema to use for  parsing the environment variables.   *
   */
  envSchema: T;
  schemaEnvironment: SchemaEnvironment;
  // Whether or not to throw an error if the env vars are invalid. Defaults to true.
  shouldThrow?: boolean;
};

export const parseEnv = <T extends ZodTypeAny>({
  envSchema,
  schemaEnvironment,
  shouldThrow = true
}: ParseEnvProps<T>): z.infer<T> => {
  if (schemaEnvironment === SchemaEnvironment.INFRA && !shouldThrow) {
    throw new Error(
      "❌ Cannot use shouldThrow=false when parsing infra env vars. The deploy will fail."
    );
  }
  const parsed = envSchema.safeParse(processEnv);

  const errorMessage = `❌ Invalid environment variables in ${schemaEnvironment}:`;
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      console.error(issue);
      console.log(parsed.error.flatten().fieldErrors);
      console.error(errorMessage);
    });

    if (shouldThrow) {
      throw new Error(errorMessage);
    }

    return {};
  }

  // Return the parsed data
  return parsed.data;
};
