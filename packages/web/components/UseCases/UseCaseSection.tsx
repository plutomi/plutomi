import { Container, Flex, Stack } from "@mantine/core";
import { UseCaseCards } from "./UseCaseCards";
import { UseCaseSegment } from "./UseCaseSegment";

export const UseCaseSection: React.FC = () => (
  <Stack justify="center">
    <Container size="md">
      <UseCaseSegment />
    </Container>

    <Flex justify="center">
      <UseCaseCards />
    </Flex>
  </Stack>
);
