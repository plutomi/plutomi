import { Button, createStyles, TextInput, Alert } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import axios from "axios";
import { Schema } from "@plutomi/validation";
import { IconAlertCircle } from "@tabler/icons-react";
import { AiFillCheckCircle } from "react-icons/ai";
import { notifications } from "@mantine/notifications";
import { handleAxiosError } from "@/utils/handleAxiosResponse";
import { useMutation } from "@tanstack/react-query";

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

  const form = useForm({
    initialValues: {
      email: ""
    },
    validate: zodResolver(Schema.Subscribe.UISchema)
  });

  const subscribe = useMutation({
    mutationFn: async () =>
      axios.post("/api/waitlist", {
        email: form.values.email
      }),
    onError: (error: unknown) => {
      const message = handleAxiosError(error);
      notifications.show({
        id: "wl-error",
        title: "An error ocurred 😢",
        message,
        color: "red",
        icon: <IconAlertCircle size={24} />
      });
    }
  });

  if (subscribe.isSuccess) {
    return (
      <Alert
        icon={<AiFillCheckCircle size="1rem" />}
        title="Awesome!"
        color="green"
        radius="md"
      >
        You&apos;ve been added to our wait list 🚀
      </Alert>
    );
  }

  return (
    <form
      onSubmit={form.onSubmit(() => {
        subscribe.mutate();
      })}
    >
      <div className={classes.controls}>
        <TextInput
          {...form.getInputProps("email")}
          placeholder="example@mail.com"
          disabled={subscribe.isLoading}
          type="email"
          classNames={{
            input: classes.input,
            root: classes.inputWrapper
          }}
        />
        <Button
          type="submit"
          loading={subscribe.isLoading}
          disabled={!form.isDirty()}
          className={classes.control}
          style={{ cursor: subscribe.isLoading ? "not-allowed" : "pointer" }}
        >
          {subscribe.isLoading ? "Joining" : "Join"}
        </Button>
      </div>
    </form>
  );
};
