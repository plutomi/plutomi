import { z } from "zod";

const baseSchema = z.object({
  code: z
    .string({
      required_error: "Code is required"
    })
    .length(6, "Code must be 5 characters")
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
