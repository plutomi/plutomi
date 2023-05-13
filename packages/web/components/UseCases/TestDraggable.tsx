import { createStyles, rem, Card, Center, Group, Text } from "@mantine/core";
import { HTMLAttributes } from "react";
import { HiUserGroup } from "react-icons/hi";

export type UseCaseCard = {
  title: string;
  icon: React.FC<any>;
  color: string;
  amount: number;
  style?: React.CSSProperties;
} & HTMLAttributes<HTMLDivElement>;

const useStyles = createStyles((theme) => ({
  card: {
    boxShadow: theme.shadows.sm,
    transition: "box-shadow 150ms ease, transform 100ms ease",
    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
      cursor: "grab"
    },

    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
  },
  section: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`
  },

  title: {
    fontWeight: 700
  },

  item: {
    display: "flex",
    borderRadius: theme.radius.md,

    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)"
    }
  },
  grid: {
    width: "80%",
    [theme.fn.smallerThan("lg")]: {
      width: "60%"
    }
  }
}));

export const TestDraggable = ({
  title,
  amount,
  icon,
  color,
  style,
  ref
}: UseCaseCard) => {
  const { classes, theme } = useStyles();

  const NewIcon = icon;

  return (
    <div {...style} ref={ref}>
      <Card className={classes.card}>
        <Card.Section py="xs">
          <Center>
            <NewIcon color={theme.colors[color][5]} size="2rem" />
          </Center>
          <Text fz="lg" mt={4} ta="center">
            {title}
          </Text>
        </Card.Section>
        <Card.Section withBorder py="1">
          <Group spacing="xs" position="center" c="dimmed">
            <Center>
              <HiUserGroup />
            </Center>
            <Text fz="md" fw={500} py={4}>
              {amount.toLocaleString()}
            </Text>
          </Group>
        </Card.Section>
      </Card>
    </div>
  );
};
