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
  Group,
  Tooltip,
  Alert
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { BsGithub, BsTwitter } from "react-icons/bs";
import axios from "axios";
import z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

type WaitListCardProps = {};

const schema = z.object({
  email: z.string().email({ message: "Invalid email" })
});

const myEmail = "jose@plutomi.com";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(180),
    paddingBottom: rem(130),
    backgroundImage: "/pluto_new_horizons.png",
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
  const clipboard = useClipboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: ""
    },
    validate: zodResolver(schema)
  });

  type FormData = z.infer<typeof schema>;

  const handleFormSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/subscribe", values);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Something went wrong signing you up 😢",
        message: "We are looking into it!",
        color: "red",
        icon: <IconAlertCircle size={24} />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size={"sm"}>
      <Toaster />

      <Card shadow="sm" padding="md" mt={"lg"} radius="md" withBorder>
        <Text weight={500} size={36}>
          Hi there!
        </Text>

        <Text>
          To enhance the long term stability of the site, I (Jose) am doing a
          major refactor. You can check the progress and all changes on GitHub
          or DM me on Twitter or by email if you have any questions 😎
        </Text>

        <Flex justify={"center"}>
          <Tooltip
            label="Email copied!"
            offset={5}
            position="top"
            radius="xl"
            transitionProps={{ duration: 100, transition: "slide-up" }}
            opened={clipboard.copied}
          >
            <Button
              variant="subtle"
              compact
              rightIcon={
                clipboard.copied ? (
                  <IconCheck size="1.2rem" stroke={1.5} />
                ) : (
                  <IconCopy size="1.2rem" stroke={1.5} />
                )
              }
              radius="xl"
              size="md"
              styles={{
                root: { paddingRight: rem(14), height: rem(48) },
                rightIcon: { marginLeft: rem(22) }
              }}
              onClick={() => clipboard.copy(myEmail)}
            >
              {myEmail}
            </Button>
          </Tooltip>
        </Flex>
        <Text>
          If you&apos;re interested in being notified when Plutomi is ready for
          use, please join our wait list!
        </Text>
        <Space h="sm" />

        {success ? (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Success!"
            color="green"
            radius="md"
          >
            You've been added to our wait list 🚀
          </Alert>
        ) : (
          <>
            <form
              onSubmit={form.onSubmit((values) => handleFormSubmit(values))}
            >
              <Group align="start">
                <TextInput
                  placeholder="example@mail.com"
                  {...form.getInputProps("email")}
                  style={{ flexGrow: 1 }}
                  disabled={isSubmitting}
                />
                <Button
                  color="indigo"
                  radius="md"
                  style={{ flexShrink: 1 }}
                  type="submit"
                  loading={isSubmitting}
                  disabled={!form.isDirty()}
                >
                  Submit
                </Button>
              </Group>
            </form>
            <Text c="dimmed">
              We won&apos;t spam you - we don&apos;t even have the ability to
              send emails yet! 😅
            </Text>{" "}
          </>
        )}

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
            rightIcon={<BsTwitter size="1.1rem" color={"#00acee"} />}
          >
            Jose on Twitter
          </Button>
        </Flex>
      </Card>
    </Container>
  );
};
