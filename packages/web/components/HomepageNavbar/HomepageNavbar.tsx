import {
  createStyles,
  Menu,
  Center,
  Header,
  Container,
  Group,
  Button,
  Burger,
  rem
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none"
    }
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none"
    }
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500
  },

  linkLabel: {
    marginRight: rem(5)
  }
}));

type HeaderActionProps = {
  links: Array<{
    link: string;
    label: string;
    links: Array<{ link: string; label: string }>;
  }>;
};

export const HomepageNavbar: React.FC<HeaderActionProps> = ({ links }) => {
  const { classes } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const router = useRouter();
  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems.length > 0) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={rem(12)} stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={classes.link}
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        {link.label}
      </a>
    );
  });

  const loginRedirect = () => {
    void router.push("/login");
  };
  return (
    <Header height={HEADER_HEIGHT} sx={{ borderBottom: 0 }}>
      <Container className={classes.inner} size="xl">
        <Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
          />
          {/* <MantineLogo size={28} /> */}
        </Group>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
        <Group>
          <Link href="/login" passHref>
            <Button variant="default" radius="md" size="md">
              Log In
            </Button>
          </Link>

          <Link href="/login" passHref>
            <Button radius="md" size="md" onClick={loginRedirect}>
              Sign Up
            </Button>
          </Link>
        </Group>
      </Container>
    </Header>
  );
};
