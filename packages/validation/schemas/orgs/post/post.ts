import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(1).max(255),
  publicOrgId: z
    .string()
    .regex(/^[a-z0-9-]*$/)
    .min(1)
    .max(25)
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
