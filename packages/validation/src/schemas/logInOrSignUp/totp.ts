import { TOTP_LENGTH } from "@plutomi/shared";
import { z } from "zod";

export const baseSchema = z.object({
  totpCode: z
    .string({
      required_error: "Code is required"
    })
    .length(TOTP_LENGTH, `Code must be ${TOTP_LENGTH} characters`)
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
