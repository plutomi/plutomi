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
import { Schemas } from "@plutomi/validation";
import toast, { Toaster } from "react-hot-toast";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

type WaitListCardProps = {};

const myEmail = "jose@plutomi.com";

const useStyles = createStyles((theme) => ({
  controls: {
    display: "flex",
    marginTop: theme.spacing.xl
  },

  inputWrapper: {
    width: "100%",
    flex: "1"
  },

  input: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  control: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,

    "&[data-loading]": {
      "&::before": {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0
      }
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
    validate: zodResolver(Schemas.Subscribe.UISchema)
  });

  const handleFormSubmit = async (values: Schemas) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/subscribe", { ...values, email: "as" });
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
              <div className={classes.controls}>
                <TextInput
                  {...form.getInputProps("email")}
                  placeholder="example@mail.com"
                  disabled={isSubmitting}
                  classNames={{
                    input: classes.input,
                    root: classes.inputWrapper
                  }}
                />
                <Button
                  color="indigo"
                  type="submit"
                  loading={isSubmitting}
                  disabled={!form.isDirty()}
                  className={classes.control}
                  style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
                >
                  {isSubmitting ? "Joining" : "Join"}
                </Button>
              </div>
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