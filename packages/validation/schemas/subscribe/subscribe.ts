import { z } from "zod";

const baseSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email("That email doesn't look right...")
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
