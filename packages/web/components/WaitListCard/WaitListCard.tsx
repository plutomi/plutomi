import { Container, Card, Space } from "@mantine/core";
import { SocialButtons } from "./SocialButtons";
import { Header } from "./Header";
import { SubscribeForm } from "./SubscribeForm";

export const WaitListCard: React.FC = () => (
  <Container size="md">
    <Card padding="md" mt="lg" radius="md">
      <Header />
      <SubscribeForm />
      <Space h="md" />
      <SocialButtons />
    </Card>
  </Container>
);
