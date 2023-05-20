import { useState } from "react";
import {
  createStyles,
  Navbar,
  Group,
  getStylesRef,
  rem,
  Anchor,
  Title,
  Button,
  Text,
  Stack,
  Flex,
  Box,
  Center
} from "@mantine/core";
import { IconSwitchHorizontal } from "@tabler/icons-react";
import { BsQuestionCircle } from "react-icons/bs";
import { TbLayoutDashboard } from "react-icons/tb";
import { BiDollarCircle } from "react-icons/bi";
import { IoBarChart } from "react-icons/io5";
import { AiOutlineForm, AiOutlineUsergroupAdd } from "react-icons/ai";
import { MdWebhook } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import type { NextPage } from "next";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  header: {
    paddingBottom: theme.spacing.md,
    marginBottom: `calc(${theme.spacing.md} * 1.5)`,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`
  },

  footer: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`
  },

  link: {
    ...theme.fn.focusStyles(),
    width: "100%",
    display: "flex",
    fontSize: theme.fontSizes.xl,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    borderRadius: theme.radius.md,
    fontWeight: 500,
    textAlign: "start",
    paddingLeft: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,

      [`& .${getStylesRef("icon")}`]: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black
      }
    }
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
    marginLeft: 0
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color
      }
    }
  }
}));

const data = [
  { link: "/dashboard", label: "Dashboard", icon: TbLayoutDashboard },
  { link: "/applications", label: "Applications", icon: AiOutlineForm },
  { link: "/questions", label: "Questions", icon: BsQuestionCircle },
  { link: "/team", label: "Team", icon: AiOutlineUsergroupAdd },
  { link: "/analytics", label: "Analytics", icon: IoBarChart },
  { link: "/webhooks", label: "Webhooks", icon: MdWebhook },
  { link: "/billing", label: "Billing", icon: BiDollarCircle },
  { link: "/settings", label: "Settings", icon: FiSettings }
];

const Dashboard: NextPage = () => {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState("Dashboard");

  const links = data.map((item) => (
    <Link href="/dashboard" style={{ textDecoration: "none" }}>
      <Button
        key={item.label}
        variant="subtle"
        onClick={(event) => {
          event.preventDefault();
          setActive(item.label);
        }}
        size="lg"
        className={
          item.label === active
            ? cx(classes.link, classes.linkActive)
            : classes.link
        }
      >
        <item.icon className={classes.linkIcon} size="1.4rem" />

        <Text fz="md">{item.label}</Text>
      </Button>
    </Link>
  ));

  return (
    <Flex>
      <Navbar width={{ sm: 300 }} p="md">
        <Navbar.Section grow>
          <Group className={classes.header}>
            <Stack>
              <Title order={2}>Plutomi</Title>
              <Text c="dimmed" size="sm">
                Default Workspace
              </Text>
            </Stack>
          </Group>
          {links}
        </Navbar.Section>

        <Navbar.Section className={classes.footer}>
          <Button
            variant="default"
            className={classes.link}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />

            <span>Change Account</span>
          </Button>
          <Anchor
            href="#"
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </Anchor>
        </Navbar.Section>
      </Navbar>

      <Center w="100%">
        <Title>Under Construction 🙂</Title>
      </Center>
    </Flex>
  );
};

export default Dashboard;
