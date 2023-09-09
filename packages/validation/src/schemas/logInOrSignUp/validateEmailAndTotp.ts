import { baseSchema as totpBaseSchema } from "./totp";
import { baseSchema as emailBaseSchema } from "./email";

// When validating the code, we need to send the email as well as the code
const baseSchema = emailBaseSchema.merge(totpBaseSchema);

export const APISchema = baseSchema;
