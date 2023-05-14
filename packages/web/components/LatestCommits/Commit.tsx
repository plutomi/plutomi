import {
  createStyles,
  Avatar,
  Text,
  Group,
  Box,
  Card,
  Anchor,
  Flex,
  MediaQuery
} from "@mantine/core";
// TODO: Remove tabler icons
import { IconMail, IconMessage, IconChevronRight } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  icon: {
    marginTop: "auto",
    marginBottom: "auto",
    color:
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]
  },
  card: {
    boxShadow: theme.shadows.sm,
    transition: "box-shadow 150ms ease, transform 100ms ease",
    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
      cursor: "pointer"
    }
  }
}));

export type CommitType = {
  url: string;
  username: string;
  name: string;
  image: string;
  date: Date;
  email: string;
  message: string;
};

export const Commit: React.FC<CommitType> = ({
  url,
  username,
  name,
  message,
  image,
  date,
  email
}) => {
  const handleCardClick = () => {
    window.open(url, "_blank");
  };

  const { classes } = useStyles();
  return (
    <>
      <MediaQuery smallerThan="lg" styles={{ display: "none" }}>
        <Card
          className={classes.card}
          padding="sm"
          onClick={handleCardClick}
          shadow="sm"
          radius="md"
        >
          <Group noWrap>
            <Avatar src={image} size={94} radius="md" />

            <Box>
              <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                {String(new Date(date).toLocaleDateString())}
              </Text>
              <Text fz="lg" fw={500}>
                {name} -{" "}
                <Anchor
                  fz="lg"
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  @{username}
                </Anchor>
              </Text>

              <Group spacing="xs" noWrap>
                <IconMail stroke={1.5} size="1rem" className={classes.icon} />
                <Text fz="md" c="dimmed">
                  {email}
                </Text>
              </Group>

              <Group spacing="xs" noWrap>
                <Flex>
                  <IconMessage
                    stroke={1.5}
                    size="1rem"
                    className={classes.icon}
                  />
                </Flex>

                <Text fz="md" c="dimmed" lineClamp={1}>
                  {message.substring(0, 200)}
                </Text>
              </Group>
            </Box>

            <Box style={{ marginLeft: "auto" }}>
              <IconChevronRight size="1.2rem" stroke={1.5} />
            </Box>
          </Group>
        </Card>
      </MediaQuery>
      <MediaQuery largerThan="lg" styles={{ display: "none" }}>
        <Card
          className={classes.card}
          padding="sm"
          onClick={handleCardClick}
          shadow="sm"
          radius="md"
        >
          <Group noWrap>
            <Avatar src={image} size={94} radius="md" />

            <Box>
              <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                {String(new Date(date).toLocaleDateString())}
              </Text>
              <Text fz="lg" fw={500}>
                {name} -{" "}
                <Anchor
                  fz="lg"
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  @{username}
                </Anchor>
              </Text>
            </Box>

            <Box style={{ marginLeft: "auto" }}>
              <IconChevronRight size="1.2rem" stroke={1.5} />
            </Box>
          </Group>
          <Group spacing="xs" noWrap mt="xs">
            <IconMail stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="md" c="dimmed">
              {email}
            </Text>
          </Group>
          <Group spacing="xs" noWrap>
            <Flex>
              <IconMessage stroke={1.5} size="1rem" className={classes.icon} />
            </Flex>

            <Text fz="md" c="dimmed" lineClamp={2}>
              {message.substring(0, 200)}
            </Text>
          </Group>
        </Card>
      </MediaQuery>
    </>
  );
};
