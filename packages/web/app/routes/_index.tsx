import { Container, Button, Group, Title } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export default function HeroTitle() {
  return (
    <Container size={700}>
      <Title order={1}>Making Applicant Management Great Again</Title>

      <h1 className="text-3xl font-bold underline text-red-400">
        Hello world!
      </h1>
      <Group>
        <Button
          size="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
        >
          Get started
        </Button>

        <Button
          component="a"
          href="https://github.com/plutomi/plutomi"
          size="xl"
          variant="default"
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<IconBrandGithub size={20} />}
        >
          GitHub
        </Button>
      </Group>
    </Container>
  );
}
