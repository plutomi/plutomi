import { useRouter } from "next/router";

type AuthContext = "login" | "signUp";

/**
 * Checks if the user is logging in or signing up
 *
 */
export const useAuthContext = (): AuthContext => {
  const router = useRouter();
  const { pathname } = router;

  // User likely already has an account if they are hitting one of these
  const loginPaths = [
    "/dashboard",
    "/applications",
    "/questions",
    "/team",
    "/analytics",
    "/billing",
    "/webhooks",
    "/settings",
    "/login"
  ];
  if (loginPaths.includes(pathname)) {
    return "login";
  }

  return "signUp";
};
