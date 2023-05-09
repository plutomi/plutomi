import {
  Title,
  Text,
  Container,
  Button,
  Overlay,
  createStyles,
  rem,
  Card,
  TextInput,
  Flex,
  Space,
  Group
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { BsGithub, BsTwitter } from "react-icons/bs";
import z from "zod";

type WaitListCardProps = {};

const schema = z.object({
  email: z.string().email({ message: "Invalid email" })
});

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
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

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

export const WaitListCard: React.FC = () => {
  const { classes, cx } = useStyles();

  const form = useForm({
    initialValues: {
      email: ""
    },
    validate: zodResolver(schema)
  });

  type FormData = z.infer<typeof schema>;

  const handleFormSubmit = (values: FormData) => {
    alert(values);
  };
  return (
    <Container size={"sm"}>
      <Card shadow="sm" padding="md" mt={"lg"} radius="md" withBorder>
        <Text weight={500} size={36}>
          Hi there!
        </Text>

        <Text>
          To enhance the long term stability of the site, I (Jose) am doing a
          major refactor. You can check the progress and all changes on GitHub
          or DM me on Twitter or by email if you have any questions 😎
        </Text>
        <Space h="md" />

        <Text>
          If you&apos;re interested in being notified when Plutomi is ready for
          use, please join our wait list!
        </Text>
        <Space h="sm" />

        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Group align="start">
            <TextInput
              placeholder="example@mail.com"
              {...form.getInputProps("email")}
              style={{ flexGrow: 1 }}
            />
            <Button color="indigo" radius="md" style={{ flexShrink: 1 }}>
              Submit
            </Button>
          </Group>
        </form>

        <Text c="dimmed">
          We won&apos;t spam you - we don&apos;t even have the ability to send
          emails yet! 😅
        </Text>

        <Space h="lg" />

        <Flex
          gap="xl"
          justify="center"
          align="center"
          direction="row"
          wrap="wrap"
        >
          <Button
            component="a"
            href="https://github.com/plutomi/plutomi"
            rel="noopener noreferrer"
            target="_blank"
            variant="default"
            radius="md"
            // leftIcon={<CgExternal size="0.9rem" />}
            rightIcon={<BsGithub size="1.1rem" color="#333" />}
          >
            Plutomi on GitHub
          </Button>

          <Button
            component="a"
            href="https://twitter.com/joswayski"
            rel="noopener noreferrer"
            target="_blank"
            variant="default"
            radius="md"
            // leftIcon={<CgExternal size="0.9rem" />}
            rightIcon={<BsTwitter size="1.1rem" color={"#00acee"} />}
          >
            Jose on GitHub
          </Button>
        </Flex>
      </Card>
    </Container>
  );
};
