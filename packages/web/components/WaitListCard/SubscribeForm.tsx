import { Button, createStyles, TextInput, Alert } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import axios from "axios";
import { Schema } from "@plutomi/validation";
import { IconAlertCircle } from "@tabler/icons-react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { handleAxiosError } from "@/utils/handleAxiosResponse";

const useStyles = createStyles((theme) => ({
  controls: {
    display: "flex",
    marginTop: theme.spacing.xs
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

export const SubscribeForm: React.FC = () => {
  const { classes } = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: ""
    },
    validate: zodResolver(Schema.Subscribe.UISchema)
  });

  const handleFormSubmit = async (values: Schema.Subscribe.UIValues) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/waitlist", values);
      setSuccess(true);
    } catch (error) {
      const message = handleAxiosError(error);
      notifications.show({
        id: "wl-error",
        title: "An error ocurred 😢",
        message,
        color: "red",
        icon: <IconAlertCircle size={24} />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return success ? (
    <Alert
      icon={<AiFillCheckCircle size="1rem" />}
      title="Awesome!"
      color="green"
      radius="md"
    >
      You&apos;ve been added to our wait list 🚀
    </Alert>
  ) : (
    <form onSubmit={form.onSubmit((values) => void handleFormSubmit(values))}>
      <div className={classes.controls}>
        <TextInput
          {...form.getInputProps("email")}
          placeholder="example@mail.com"
          disabled={isSubmitting}
          type="email"
          classNames={{
            input: classes.input,
            root: classes.inputWrapper
          }}
        />
        <Button
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
  );
};
