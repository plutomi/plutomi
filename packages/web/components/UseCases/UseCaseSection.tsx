import { Container, Stack } from "@mantine/core";
import { UseCaseCards } from "./UseCaseCards";
import { UseCaseSegment } from "./UseCaseSegment";

export const UseCaseSection: React.FC = () => (
  <Container size="md">
    <Stack justify="center">
      <UseCaseSegment />
      <UseCaseCards />
    </Stack>
  </Container>
);
