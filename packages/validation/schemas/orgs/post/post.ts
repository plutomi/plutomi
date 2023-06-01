import { z } from "zod";

const baseSchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string."
    })
    .min(1, "Name must be at least 1 character long.")
    .max(100, "Name must be at most 100 characters long."),
  customWorkspaceId: z
    .string({
      required_error: "Workspace ID is required.",
      invalid_type_error: "Workspace ID must be a string."
    })
    .regex(
      /^[a-z0-9-]*$/,
      "Workspace ID must only contain lowercase letters, numbers, and dashes."
    )
    .min(1, "Workspace ID must be at least 1 character long.")
    .max(25, "Workspace ID must be at most 25 characters long.")
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
