import { Container, AppShell } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRef } from "react";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";

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
  const errorToastShownRef = useRef(false);

  const destinationContext = getDestinationContext(router.pathname);
  const { isLoading, isError, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await axios.get("/api/users/me");
      return result;
    },
    retry: false
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      return (
        <AppShell padding={0}>
          <LogInOrSignUpForm title={destinationContext} />
        </AppShell>
      );
    }

    if (!errorToastShownRef.current) {
      errorToastShownRef.current = true;
      notifications.show({
        withCloseButton: true,
        title: "An error ocurred",
        message: "We were unable to retrieve your info. Please log in again!",
        color: "red",
        autoClose: 5000,
        icon: <IconX />,
        loading: false
      });
    }

    return (
      <AppShell padding={0}>
        <LogInOrSignUpForm title={destinationContext} />
      </AppShell>
    );
  }

  return <Container>{children}</Container>;
};
