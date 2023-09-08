import { AppShell, type AppShellProps } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { LogInOrSignUpForm } from "../LogInOrSignUp";
import { PageLoader } from "../PageLoader";
import { getLoggedOutPageHeader } from "./utils";
import { QueryKeys } from "../../@types";

export const PageShell: React.FC<AppShellProps> = ({
  navbarOffsetBreakpoint = "sm",
  asideOffsetBreakpoint = "sm",
  ...props
}) => {
  const router = useRouter();
  const loggedOutPageHeader = getLoggedOutPageHeader(router.pathname);

  const { isLoading, isError } = useQuery({
    queryKey: [QueryKeys.GET_CURRENT_USER],
    queryFn: async () => {
      const result = await axios.get("/api/users/me");
      return result;
    },
    retry: false,
    // If you switch tabs to get the login code, we don't want to refetch and reset the state
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <AppShell padding={0}>
        <LogInOrSignUpForm title={loggedOutPageHeader} />
      </AppShell>
    );
  }

  return (
    <AppShell
      navbarOffsetBreakpoint={navbarOffsetBreakpoint}
      asideOffsetBreakpoint={asideOffsetBreakpoint}
      {...props}
    />
  );
};
