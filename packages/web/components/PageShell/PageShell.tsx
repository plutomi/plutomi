import { Center, Container, Loader, AppShell, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { LogInOrSignUpForm } from "../LogInOrSignUp";

type PageShellProps = {
  children: React.ReactNode;
};

const getDestinationContext = (pathName: string) => {
  if (pathName === "/dashboard") {
    return "Log in to view your dashboard";
  }

  if (pathName === "/test") {
    return "Log in to view your test page";
  }

  return "Log in to continue.";
};
export const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const router = useRouter();

  const destinationContext = getDestinationContext(router.pathname);
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await axios.get("/api/users/me");
      return result;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <AppShell padding={0}>
        <Center h="100%" w="100%">
          <Loader size="xl" variant="dots" />
        </Center>
      </AppShell>
    );
  }

  if (isError) {
    if (error.response.status === 401) {
      return (
        <AppShell padding={0}>
          <LogInOrSignUpForm title={destinationContext} />
        </AppShell>
      );
    }

    return (
      <AppShell padding={0}>
        <Center h="100%" w="100%">
          <Alert
            icon={<IconAlertCircle size={24} />}
            title="An error ocurred"
            color="red"
            radius="md"
          >
            We were not able to retrieve your info. Try logging in again!
          </Alert>
        </Center>
      </AppShell>
    );
  }

  return <Container>{children}</Container>;
};
