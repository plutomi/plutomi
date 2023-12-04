import { HeaderMenu } from "@/components/HeaderMenu/HeaderMenu";
import { UseCaseSelectorSection } from "@/components/UseCases/UseCaseSelectorSection";
import { Container, Center, Space, Box } from "@mantine/core";

export default function Page() {
  return (
    <Container size="xl" mt={80}>
      <HeaderMenu />
      <Space h={20} />
      <Container fluid>
        <UseCaseSelectorSection />
      </Container>
    </Container>
  );
}
