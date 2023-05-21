import type { z } from "zod";
import { baseSchema as totpBaseSchema } from "./totpCode";
import { baseSchema as emailBaseSchema } from "./email";

// When validating the code, we need to send the email as well as the code
const baseSchema = emailBaseSchema.merge(totpBaseSchema);

export const UISchema = baseSchema;
export type UIValues = z.infer<typeof UISchema>;

export const APISchema = baseSchema;
export type APIValues = z.infer<typeof APISchema>;
