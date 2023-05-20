import { z } from "zod";
import { emailSchema } from "../shared";

const baseSchema = z.object({
  email: emailSchema
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
