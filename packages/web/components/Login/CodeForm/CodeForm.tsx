import { Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { generateLoginCode } from "@plutomi/shared";
import { Schema } from "@plutomi/validation";
import axios from "axios";

export const LoginEmailForm: React.FC = () => {
  const form = useForm<Schema.Login.code.UIValues>({
    initialValues: {
      loginCode: ""
    },

    validate: zodResolver(Schema.Login.code.UISchema)
  });

  const handleFormSubmit = async (values: Schema.Login.code.UIValues) => {
    try {
      alert("set code");
      //   await axios.post("/api/requestLoginCode", { values });
    } catch (error) {
      console.error(error);
    }
  };

  const placeholderCode = generateLoginCode();
  return (
    <form onSubmit={form.onSubmit((values) => void handleFormSubmit(values))}>
      <Stack>
        <TextInput
          required
          label="Login Code"
          type="text"
          placeholder={placeholderCode}
          value={form.values.loginCode}
          onChange={(event) => {
            form.setFieldValue("loginCode", event.currentTarget.value);
          }}
          error={form.errors.loginCode}
          radius="md"
        />
      </Stack>
    </form>
  );
};
