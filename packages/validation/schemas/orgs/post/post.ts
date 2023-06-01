import { z } from "zod";

const baseSchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string."
    })
    .min(1, "Name must be at least 1 character long.")
    .max(255, "Name must be at most 255 characters long.")
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
