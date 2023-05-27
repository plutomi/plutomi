import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Button,
  getStylesRef,
  Group,
  Title,
  createStyles,
  rem,
  Center,
  Text
} from "@mantine/core";
import { IconInfoCircle, IconSwitchHorizontal } from "@tabler/icons-react";
import { MdLogout } from "react-icons/md";
import type { NextPage } from "next";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useRouter } from "next/router";
import { handleAxiosError } from "@/utils/handleAxiosResponse";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/@types";
import { sideBarData } from "./utils";

const useStyles = createStyles((theme) => ({
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

export const DashboardContent: NextPage = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { classes, cx } = useStyles();
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");

  const { refetch } = useQuery({
    queryKey: [QueryKeys.LOGOUT],
    queryFn: async () => {
      const result = await axios.get("/api/logout");
      return result;
    },
    retry: false,
    enabled: false,
    onSuccess: () => {
      void router.push("/");
      notifications.show({
        id: "logout",
        message: "You have been logged out. See you soon!",
        color: "blue",
        autoClose: 5000,
        icon: <IconInfoCircle />
      });
    },
    onError: (error) => {
      const message = handleAxiosError(error);
      notifications.show({
        id: "logout-error",
        title: "An error ocurred logging you out",
        message,
        color: "red",
        autoClose: 5000
      });
    }
  });

  const links = sideBarData.map((item) => (
    <Link
      href="/dashboard"
      passHref
      style={{ textDecoration: "none" }}
      key={item.label}
    >
      <Button
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
    <AppShell
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          width={{ sm: 300 }}
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
        >
          <Navbar.Section grow>{links}</Navbar.Section>

          <Navbar.Section className={classes.footer}>
            <Button variant="subtle" size="lg" className={classes.link}>
              <IconSwitchHorizontal
                className={classes.linkIcon}
                size="1.4rem"
              />
              <Text fz="md">Change Workspace</Text>
            </Button>

            <Button
              variant="subtle"
              onClick={() => {
                void refetch();
              }}
              size="lg"
              className={classes.link}
            >
              <MdLogout className={classes.linkIcon} size="1.4rem" />
              <Text fz="md">Logout</Text>
            </Button>
          </Navbar.Section>
        </Navbar>
      }
      //   aside={
      //     <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      //       <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      //         <Center w="100%">
      //           <Title>Under Construction 🙂</Title>
      //         </Center>
      //       </Aside>
      //     </MediaQuery>
      //   }
      //   footer={
      //     <Footer height={60} p="md">
      //       Application footer
      //     </Footer>
      //   }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => {
                  setOpened((o) => !o);
                }}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Group>
              <Link
                href="/"
                passHref
                style={{ textDecoration: "none", color: "black" }}
              >
                <Title order={2}>Plutomi</Title>
              </Link>
            </Group>
          </div>
        </Header>
      }
    >
      <Center w="100%">
        <Title>Under Construction 🙂</Title>
      </Center>
    </AppShell>
  );
};
