import type { GetStaticProps, NextPage } from "next";
import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group,
  rem
} from "@mantine/core";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(120),
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor
    }).background
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(220),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors[theme.primaryColor][3],

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(120)
    }
  },

  title: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(38),
    color: theme.white,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(32)
    }
  },

  description: {
    maxWidth: rem(540),
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors[theme.primaryColor][1]
  }
}));

export const FiveHundred: NextPage = () => {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>Something bad just happened...</Title>
        <Text size="lg" align="center" className={classes.description}>
          Our servers could not handle your request. Don&apos;t worry, our
          development team was already notified. Try refreshing the page.
        </Text>
        <Group position="center">
          <Button
            variant="white"
            size="md"
            onClick={() => void router.push("/")}
          >
            Go Home
          </Button>
        </Group>
      </Container>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default FiveHundred;
