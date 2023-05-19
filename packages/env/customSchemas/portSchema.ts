import * as z from "zod";

export const portSchema = z.coerce
  .number()
  .int()
  .positive()
  .gte(1024)
  .lte(65535)
  // CDK Requires this to be a string in the task definition port mappings because of reasons
  .transform((val) => val.toString());
