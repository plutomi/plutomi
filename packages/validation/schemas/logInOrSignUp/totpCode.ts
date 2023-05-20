import { TOTP_CODE_LENGTH } from "@plutomi/shared";
import { z } from "zod";

const baseSchema = z.object({
  totpCode: z
    .string({
      required_error: "Code is required"
    })
    .length(TOTP_CODE_LENGTH, `Code must be ${TOTP_CODE_LENGTH} characters`)
});

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
