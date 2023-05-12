import { Flex, Tooltip, Button, rem, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";

// TODO Move to shared
const myEmail = "jose@plutomi.com";

export const Header: React.FC = () => {
  const clipboard = useClipboard();

  return (
    <>
      <Text weight={500} size={36}>
        Hi there!
      </Text>

      <Text>
        To enhance the long term stability of the site, I (Jose) am doing a
        major refactor. You can check the progress and all changes on GitHub or
        DM me on Twitter or by email if you have any questions 😎
      </Text>

      <Flex justify="center">
        <Tooltip
          label="Email copied!"
          offset={5}
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
              rightIcon: { marginLeft: rem(22) }
            }}
            onClick={() => {
              clipboard.copy(myEmail);
            }}
          >
            {myEmail}
          </Button>
        </Tooltip>
      </Flex>
      <Text>
        If you&apos;re interested in being notified when Plutomi is ready for
        use, please join our wait list!
      </Text>
    </>
  );
};
