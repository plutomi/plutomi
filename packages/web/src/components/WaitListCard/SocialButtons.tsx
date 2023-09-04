import { BsGithub, BsTwitter } from "react-icons/bs";
import { Flex, Tooltip, Button, rem, Stack } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { PlutomiEmails } from "@plutomi/shared";

export const SocialButtons: React.FC = () => {
  const clipboard = useClipboard();

  return (
    <Stack justify="center" align="center" spacing="xs">
      <Tooltip
        label="Email copied!"
        position="top"
        radius="xl"
        transitionProps={{ duration: 100, transition: "slide-up" }}
        opened={clipboard.copied}
      >
        <Button
          variant="subtle"
          compact
          rightIcon={
            clipboard.copied ? (
              <IconCheck size="1.2rem" stroke={1.5} />
            ) : (
              <IconCopy size="1.2rem" stroke={1.5} />
            )
          }
          radius="xl"
          size="md"
          styles={{
            root: { paddingRight: rem(14), height: rem(48) },
            rightIcon: { marginLeft: rem(3) }
          }}
          onClick={() => {
            clipboard.copy(PlutomiEmails.JOSE);
          }}
        >
          {PlutomiEmails.JOSE}
        </Button>
      </Tooltip>
      <Flex
        gap="xl"
        justify="center"
        align="center"
        direction="row"
        wrap="wrap"
      >
        <Button
          component="a"
          href="https://github.com/plutomi/plutomi"
          rel="noopener noreferrer"
          target="_blank"
          variant="default"
          radius="md"
          rightIcon={<BsGithub size="1.1rem" color="#333" />}
        >
          Plutomi on GitHub
        </Button>

        <Button
          component="a"
          href="https://twitter.com/notjoswayski"
          rel="noopener noreferrer"
          target="_blank"
          variant="default"
          radius="md"
          rightIcon={<BsTwitter size="1.1rem" color="#00acee" />}
        >
          Jose on Twitter
        </Button>
      </Flex>
    </Stack>
  );
};
