import { createStyles, Avatar, Text, Group } from "@mantine/core";
import { IconPhoneCall, IconAt } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`
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
    <div>
      <Group noWrap>
        <Avatar src={image} size={94} radius="md" />
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            {date.toLocaleDateString()}
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            {name}
          </Text>

          <Group noWrap spacing={10} mt={3}>
            <IconAt stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              {email}
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <IconPhoneCall stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              idk
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
};
