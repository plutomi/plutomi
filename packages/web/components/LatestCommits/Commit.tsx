import {
  createStyles,
  Avatar,
  Text,
  Group,
  Box,
  Card,
  Button
} from "@mantine/core";
import {
  IconMail,
  IconMessage,
  IconChevronRight,
  IconExternalLink
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
  const handleCardClick = () => {
    window.open(url, "_blank");
  };

  const { classes } = useStyles();
  return (
    <Card className={classes.card} padding="sm" onClick={handleCardClick}>
      <Group noWrap>
        <Avatar src={image} size={94} radius="md" />

        <Box>
          <Card.Section>
            <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
              {String(new Date(date).toLocaleDateString())}
            </Text>
            <Text fz="lg" fw={500}>
              {name} -{" "}
              <Text
                component="a"
                href="https://google.com"
                onClick={(e) => {
                  e.stopPropagation(); // This will prevent the card's click event from firing when the link is clicked
                }}
              >
                Click Me
              </Text>
            </Text>
          </Card.Section>

          {/* <a
          href="https://google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          blah
        </a> */}
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
