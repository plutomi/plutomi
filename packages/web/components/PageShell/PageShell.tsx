import { Container, AppShell } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { QueryKeys } from "@/@types";
import { LogInOrSignUpForm } from "../LogInOrSignUp";
import { PageLoader } from "../PageLoader";

type PageShellProps = {
  children: React.ReactNode;
};

// What should show on the header of the login page
const getDestinationContext = (pathName: string) => {
  if (pathName === "/dashboard") {
    return "Log in to view your dashboard";
  }

  if (pathName === "/applications") {
    return "Log in to view your applications";
  }

  if (pathName === "/webhooks") {
    return "Log in to view your webhooks";
  }

  if (pathName === "/team") {
    return "Log in to view your team";
  }

  if (pathName === "/settings") {
    return "Log in to view your settings";
  }

  if (pathName === "/billing") {
    return "Log in to view your billing details";
  }

  return "Log in to continue.";
};

export const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const router = useRouter();
  const destinationContext = getDestinationContext(router.pathname);

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
    // notifications.show({
    //   id: "login-error",
    //   withCloseButton: true,
    //   title: "An error ocurred",
    //   message: "We were unable to retrieve your info. Please log in again!",
    //   color: "red",
    //   autoClose: 5000,
    //   icon: <IconX />,
    //   loading: false
    // });

    return (
      <AppShell padding={0}>
        <LogInOrSignUpForm title={destinationContext} />
      </AppShell>
    );
  }

  return <Container>{children}</Container>;
};
