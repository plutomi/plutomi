import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(1).max(255)
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
