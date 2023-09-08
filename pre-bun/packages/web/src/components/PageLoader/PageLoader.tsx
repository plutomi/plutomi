import { AppShell, Center, Loader } from "@mantine/core";

export const PageLoader: React.FC = () => (
  <AppShell padding={0}>
    <Center h="100%" w="100%">
      <Loader size="xl" variant="dots" />
    </Center>
  </AppShell>
);
