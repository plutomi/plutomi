import { Container, Card, Space } from "@mantine/core";
import { SocialButtons } from "./SocialButtons";
import { Header } from "./Header";
import { SubscribeForm } from "./SubscribeForm";

export const WaitListCard: React.FC = () => (
  <Container size="sm">
    <Card shadow="sm" padding="md" mt="lg" radius="md" withBorder>
      <Header />
      <Space h="sm" />
      <SubscribeForm />
      <Space h="lg" />
      <SocialButtons />
    </Card>
  </Container>
);
