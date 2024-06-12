import * as zod from "zod";

const envSchema = zod.object({
  BASE_WEB_URL: zod.string().min(1),
  MAIL_FROM_SUBDOMAIN: zod.string().min(1),
});

export const env = envSchema.parse({
  BASE_WEB_URL: process.env.BASE_WEB_URL,
  MAIL_FROM_SUBDOMAIN: zod.string().min(1),
});
