import type Cookies from "cookies";
import { env } from "../env";
import { MAX_SESSION_AGE_IN_MS } from "../../consts";

export const getCookieSettings = (): Cookies.SetOption => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: MAX_SESSION_AGE_IN_MS, // 1 day
  signed: true,
  domain: env.NEXT_PUBLIC_BASE_URL
});
