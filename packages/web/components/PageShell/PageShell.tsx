import Login from "@/pages/login";
import {
  Center,
  Container,
  Flex,
  Loader,
  Navbar,
  Text,
  AppShell,
  Stack,
  Alert
} from "@mantine/core";
import { LogInOrSignUp } from "@plutomi/validation/schemas";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LogInOrSignUpForm } from "../LogInOrSignUp";

type PageShellProps = {
  children: React.ReactNode;
};

export const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await axios.get("/api/users/me");
      return result;
    }
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
          <LogInOrSignUpForm />
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
            We weren't able to retrieve your info. Try logging in again!
          </Alert>
        </Center>
      </AppShell>
    );
  }

  return (
    <Container style={{ height: "100%", border: "2px solid blue" }}>
      {children}
    </Container>
  );
};
