import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  TextInput
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import z from "zod";

type WaitListCardProps = {};

const schema = z.object({
  email: z.string().email({ message: "Invalid email" })
});

export const WaitListCard: React.FC = () => {
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
    <Card shadow="sm" padding="md" mt={"lg"} radius="md" withBorder>
      {/* <Group position="apart" mb="xs">
        <Text weight={500}>Norway Fjord Adventures</Text>
        <Badge color="pink" variant="light">
          On Sale
        </Badge>
      </Group> */}
      <Text weight={500} size={"lg"}>
        Hi there!
      </Text>

      <Text size="md">Plutomi is currently</Text>

      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <TextInput
          placeholder="example@mail.com"
          {...form.getInputProps("email")}
        />
      </form>
    </Card>
  );
};
