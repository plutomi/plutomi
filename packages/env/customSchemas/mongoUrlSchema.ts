import * as z from "zod";

// https://regex101.com/r/mV2cR7/47
export const mongoUrlSchema = z
  .string()
  .regex(
    /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\S+?):(\d+)(\/(\S+?))?(\?replicaSet=(\S+?))?$/gm
  );
