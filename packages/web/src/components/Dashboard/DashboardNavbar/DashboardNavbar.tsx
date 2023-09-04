import {
  Button,
  Navbar,
  Text,
  createStyles,
  getStylesRef,
  rem
} from "@mantine/core";
import { IconInfoCircle, IconSwitchHorizontal } from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { MdLogout } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { sideBarData } from "../utils";
import { QueryKeys } from "../../../@types";
import { useDashboardState } from "../../../hooks";
import { handleAxiosError } from "../../../utils/handleAxiosResponse";

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

export const DashboardNavbar: React.FC = () => {
  const [active, setActive] = useState("Dashboard");
  const { navbarIsOpen } = useDashboardState();

  const { classes, cx } = useStyles();
  const router = useRouter();

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
        autoClose: 3000,
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

  return (
    <Navbar
      width={{ sm: 300 }}
      p="md"
      hiddenBreakpoint="sm"
      hidden={!navbarIsOpen}
    >
      <Navbar.Section grow>{links}</Navbar.Section>
      <Navbar.Section className={classes.footer}>
        <Button variant="subtle" size="lg" className={classes.link}>
          <IconSwitchHorizontal className={classes.linkIcon} size="1.4rem" />
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
  );
};
