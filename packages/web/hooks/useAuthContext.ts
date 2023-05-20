import { useRouter } from "next/router";

type AuthContext = "login" | "signUp";

/**
 * Checks if the use is logging in or signing up
 *
 */
export const useAuthContext = (): AuthContext => {
  const router = useRouter();
  const { pathname } = router;

  if (pathname === "/login") {
    return "login";
  }

  return "signUp";
};
