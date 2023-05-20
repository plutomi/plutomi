import { Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Schema } from "@plutomi/validation";
import axios from "axios";

export const LoginEmailForm: React.FC = () => {
  const form = useForm<Schema.Login.email.UIValues>({
    initialValues: {
      email: ""
    },
    validate: zodResolver(Schema.Login.email.UISchema)
  });

  const handleFormSubmit = async (values: Schema.Login.email.UIValues) => {
    try {
      alert("setn");
      //   await axios.post("/api/requestLoginCode", { values });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => void handleFormSubmit(values))}>
      <Stack>
        <TextInput
          required
          label="Email"
          type="email"
          placeholder="jose@plutomi.com"
          value={form.values.email}
          onChange={(event) => {
            form.setFieldValue("email", event.currentTarget.value);
          }}
          error={form.errors.email}
          radius="md"
        />
      </Stack>
    </form>
  );
};
