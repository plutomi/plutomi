import {
  createStyles,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
  rem
} from "@mantine/core";
import { PlutomiEmails } from "@plutomi/shared";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(80)
  },

  title: {
    fontWeight: 900,
    fontSize: rem(34),
    marginBottom: theme.spacing.md,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(32)
    }
  },

  control: {
    [theme.fn.smallerThan("sm")]: {
      width: "100%"
    }
  },

  mobileImage: {
    [theme.fn.largerThan("sm")]: {
      display: "none"
    }
  },

  desktopImage: {
    [theme.fn.smallerThan("sm")]: {
      display: "none"
    }
  }
}));

export const FourOhFour: NextPage = () => {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <Container className={classes.root}>
      <SimpleGrid
        spacing={80}
        cols={2}
        breakpoints={[{ maxWidth: "sm", cols: 1, spacing: 40 }]}
      >
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text color="dimmed" size="lg">
            The Page you are trying to open does not exist. You may have
            mistyped the address, or the page has been moved to another URL. If
            you think this is an error contact {PlutomiEmails.JOSE}
          </Text>
          <Button
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
            onClick={() => void router.push("/")}
          >
            Get back to home page
          </Button>
        </div>
      </SimpleGrid>
    </Container>
  );
};

export default FourOhFour;
