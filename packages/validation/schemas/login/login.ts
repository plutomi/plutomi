import { LOGIN_CODE_LENGTH } from "@plutomi/shared";
import { z } from "zod";
import { emailSchema } from "../shared";

const baseSchema = z.object({
  email: emailSchema,
  code: z
    .string({
      required_error: "Login code is required"
    })
    .length(
      LOGIN_CODE_LENGTH,
      `Login code must be ${LOGIN_CODE_LENGTH} characters`
    )
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
