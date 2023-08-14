import { type ICookies } from "cookies";
import { getSessionCookieName } from "./getSessionCookieName";
import { getCookieSettings } from "./getCookieSettings";

type ClearCookieProps = {
  cookieJar: ICookies;
};

export const clearCookie = ({ cookieJar }: ClearCookieProps) =>
  cookieJar.set(getSessionCookieName(), undefined, getCookieSettings());
