import type Cookies from "cookies";
import { env } from "../env";

export const getCookieSettings = (): Cookies.SetOption => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 1000 * 60 * 60 * 24, // 1 day
  signed: true,
  domain: env.NEXT_PUBLIC_BASE_URL
});
