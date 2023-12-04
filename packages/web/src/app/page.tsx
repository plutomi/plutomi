import { HeaderMenu } from "@/components/HeaderMenu/HeaderMenu";
import { UseCaseSelector } from "@/components/UseCaseSelector/UseCaseSelector";
import { UseCaseSelectorSection } from "@/components/UseCaseSelector/UseCaseSelectorSection";
import { Container, Center, Space, Box } from "@mantine/core";

export default function Page() {
  return (
    <Container size="xl" mt={80}>
      <HeaderMenu />
      <Space h={20} />
      <Container size={"sm"}>
        <Center>
          <UseCaseSelectorSection />
        </Center>
      </Container>
    </Container>
  );
}
