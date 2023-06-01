import { Title, Text, Container, createStyles, rem } from "@mantine/core";
import axios from "axios";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(120),
    paddingBottom: rem(70),

    [theme.fn.smallerThan("xs")]: {
      paddingTop: rem(80),
      paddingBottom: rem(50)
    }
  },

  inner: {
    position: "relative",
    zIndex: 1
  },

  title: {
    fontWeight: 900,
    fontSize: rem(72),
    letterSpacing: rem(-1),
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    color: theme.colors.dark[9],
    marginBottom: theme.spacing.xs,
    textAlign: "center",
    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(46),
      textAlign: "left"
    }
  },

  highlight: {
    color: theme.colors[theme.primaryColor][4]
  },

  description: {
    color: theme.colors.dark[4],
    textAlign: "center",
    fontSize: rem(28),

    [theme.fn.smallerThan("xs")]: {
      fontSize: theme.fontSizes.lg,
      textAlign: "left"
    }
  },

  controls: {
    marginTop: `calc(${theme.spacing.xl} * 1.5)`,
    display: "flex",
    justifyContent: "center",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column"
    }
  },

  control: {
    height: rem(42),
    fontSize: theme.fontSizes.md,

    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md
    },

    [theme.fn.smallerThan("xs")]: {
      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0
      }
    }
  },

  secondaryControl: {
    color: theme.white,
    backgroundColor: "rgba(255, 255, 255, .4)",

    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, .45) !important"
    }
  }
}));

export const createOrg = async () => {
  try {
    await axios.post("/api/orgs", { name: "test", publicOrgId: "beans" });
    alert("Success");
  } catch (error) {
    alert(error.response.data.message);
    console.error(error);
  }
};
export const LandingHero: React.FC = () => {
  const { classes } = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.inner}>
        <Title className={classes.title}>
          Applicant management at{" "}
          <Text
            component="span"
            inherit
            className={classes.highlight}
            variant="gradient"
            gradient={{
              from: "brand.5",
              to: "brand.3",
              deg: 20
            }}
          >
            any scale
          </Text>
        </Title>
        <button type="submit" onClick={() => createOrg()}>
          CREATe ORG
        </button>

        <Container size={1100}>
          <Text size="lg" className={classes.description}>
            Plutomi helps you streamline your application process with automated
            workflows
          </Text>
        </Container>
      </div>
    </div>
  );
};
