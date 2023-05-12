import { Container, Stack } from "@mantine/core";
import { UseCaseCards } from "./UseCaseCards";
import { UseCaseSegment } from "./UseCaseSegment";

export const UseCaseSection: React.FC = () => (
  <Stack justify="center" style={{ border: "2px solid blue" }}>
    <Container size="md" style={{ border: "2px solid red" }}>
      <UseCaseSegment />
    </Container>

    <Container size="md">
      <UseCaseCards />
    </Container>
  </Stack>
);
