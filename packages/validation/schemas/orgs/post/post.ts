import { z } from "zod";
import { reservedWorkspaceIds } from "../../../consts";
import { trim, trimAndLowerCase } from "../../utils";

const baseSchema = z.object({
  name: z.preprocess(
    trim,
    z
      .string({
        required_error: "Organization name is required.",
        invalid_type_error: "Organization name must be a string."
      })
      .trim()
      .min(1, "Organization name must be at least 1 character long.")
      .max(100, "Organization name must be at most 100 characters long.")
  ),
  customWorkspaceId: z.preprocess(
    trimAndLowerCase,
    z
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
      .refine(
        (value) => reservedWorkspaceIds.every((id) => id !== value),
        (value) => ({
          message: `'${value}' cannot be used as a workspace ID.`
        })
      )
  )
});

// Note: This is a multi-step form on the FE
export const UIOrgStepSchema = baseSchema.pick({ name: true });
export const UIWorkspaceIdStepSchema = baseSchema.pick({
  customWorkspaceId: true
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
