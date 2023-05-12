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
  UnstyledButton
} from "@mantine/core";
import {
  IconPhoneCall,
  IconAt,
  IconMail,
  IconMessage,
  IconChevronRight
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0]
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
    // <Container size="md" style={{ border: "2px solid red" }}>
    //   <Avatar src={image} size={94} radius="md" />

    //   <Stack>

    //     </Text>
    //   </Stack>
    // </Container>
    // <Stack align="flex-start" style={{ maxWidth: "lg" }}>
    //   <Group noWrap style={{ border: "2px solid red" }} position="left">
    //     <Stack>

    //       <Group
    //         noWrap
    //         spacing={10}
    //         mt={3}
    //         style={{ border: "2px solid purple" }}
    //       >
    //         <IconMail stroke={1.5} size="1rem" className={classes.icon} />
    //         <Text fz="xs" c="dimmed">
    //           {email}
    //         </Text>
    //       </Group>

    //     </Stack>
    //   </Group>
    // </Stack>
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {name}
          </Text>

          <Text color="dimmed" size="xs">
            {email}
          </Text>

          <IconMessage stroke={1.5} size="1rem" />
          <Text fz="xs" c="dimmed" truncate>
            {message}
          </Text>
        </div>

        <IconChevronRight size="0.9rem" stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
};
