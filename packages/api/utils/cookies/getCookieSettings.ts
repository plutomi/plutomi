import type Cookies from "cookies";
import { env } from "../env";
import { COOKIE_MAX_AGE_IN_MS } from "../../consts";

export const getCookieSettings = (): Cookies.SetOption => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: COOKIE_MAX_AGE_IN_MS, // 1 day
  signed: true,
  domain: env.NEXT_PUBLIC_BASE_URL
});
