import { useRouter } from "next/router";

export type AuthContext = "login" | "signUp";

/**
 * Checks if the user is logging in or signing up
 *
 */
export const useAuthContext = (): AuthContext => {
  const router = useRouter();
  const { pathname } = router;

  if (pathname === "/signup") {
    return "signUp";
  }

  // Any other route is typically a returning user
  return "login";
};
