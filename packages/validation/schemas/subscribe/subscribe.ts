import { z } from "zod";

const baseSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email("Invalid email")
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = z.object({
  body: baseSchema
});
export type APIValues = z.infer<typeof APISchema>;
