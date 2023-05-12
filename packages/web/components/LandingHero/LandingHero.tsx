import {
  Title,
  Text,
  Container,
  Overlay,
  createStyles,
  rem,
  useMantineTheme
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(180),
    paddingBottom: rem(130),
    backgroundImage:
      "url(https://www.nasa.gov/sites/default/files/thumbnails/image/nh-apluto-wide-9-17-15-final_0.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",

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
    fontWeight: 800,
    fontSize: rem(70),
    letterSpacing: rem(-1),
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    color: theme.white,
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
    color: theme.colors.gray[0],
    textAlign: "center",
    fontSize: rem(28),

    [theme.fn.smallerThan("xs")]: {
      fontSize: theme.fontSizes.md,
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

const LandingHero: React.FC = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <div className={classes.wrapper}>
      <Overlay color="#000" opacity={0.65} zIndex={1} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          Applicant management at{" "}
          <Text
            component="span"
            inherit
            className={classes.highlight}
            variant="gradient"
            gradient={{
              from: theme.colors.indigo[6],
              to: theme.colors.teal[3],
              deg: 20
            }}
          >
            any scale
          </Text>
        </Title>

        <Container size={900}>
          <Text size="lg" className={classes.description}>
            Plutomi streamlines your application process with automated
            workflows
          </Text>
        </Container>
      </div>
    </div>
  );
};

export default LandingHero;
