import { Center, Container, Flex, Loader, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      <Flex
        h="100%"
        w="100%"
        style={{ minHeight: "100%", border: "2px solid red" }}
      >
        <Center h="100%" style={{ border: "2px solid green" }}>
          <Loader size="xl" variant="dots" />
        </Center>
      </Flex>
    );
  }

  if (isError) {
    if (error.response.status === 401) {
      return (
        <Container>
          <Text fz="md">You are not logged in.</Text>
        </Container>
      );
    }
    return <span>Error: {error.message}</span>;
  }

  return <Container>{children}</Container>;
};
