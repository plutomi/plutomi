import { Container } from "@mantine/core";
import { UseCaseCards } from "./UseCaseCards";
import { UseCaseSegment } from "./UseCaseSegment";

export const UseCaseSection: React.FC = () => (
  <Container size="lg">
    <UseCaseSegment />
    <UseCaseCards />
  </Container>
);
