import { Container, AppShell } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { QueryKeys } from "@/@types";
import { LogInOrSignUpForm } from "../LogInOrSignUp";
import { PageLoader } from "../PageLoader";
import { getLoggedOutPageHeader } from "./utils";

type PageShellProps = {
  children: React.ReactNode;
};

export const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const router = useRouter();
  const destinationContext = getLoggedOutPageHeader(router.pathname);

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
        <LogInOrSignUpForm title={destinationContext} />
      </AppShell>
    );
  }

  return <Container>{children}</Container>;
};
