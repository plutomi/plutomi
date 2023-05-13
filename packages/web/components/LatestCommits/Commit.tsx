import {
  createStyles,
  Avatar,
  Text,
  Group,
  Container,
  Box,
  Stack,
  Flex,
  Paper,
  Grid,
  UnstyledButton,
  Card,
  Anchor
} from "@mantine/core";
import {
  IconPhoneCall,
  IconAt,
  IconMail,
  IconMessage,
  IconChevronRight
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]
  },
  card: {
    boxShadow: theme.shadows.sm,
    transition: "box-shadow 150ms ease, transform 100ms ease",
    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)"
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
  const { classes } = useStyles();
  return (
    <Card
      className={classes.card}
      padding="sm"
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Group noWrap>
        <Avatar src={image} size={94} radius="md" />

        <Box>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            {String(new Date(date).toLocaleDateString())}
          </Text>

          <Text fz="lg" fw={500}>
            {name} -{" "}
            <Anchor href={`https://github.com/${username}`} target="_blank">
              @{username}
            </Anchor>
          </Text>

          <Group spacing={6} noWrap>
            <IconMail stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="md" c="dimmed">
              {email}
            </Text>
          </Group>

          <Group spacing={6} noWrap>
            <IconMessage stroke={1.5} size="1rem" className={classes.icon} />
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
  );
};
