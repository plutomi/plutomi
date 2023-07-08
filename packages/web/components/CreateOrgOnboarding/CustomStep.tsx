import { TextInput, Flex } from "@mantine/core";

// TODO: Remove
export const CustomStep = ({ form }: { form: any }) => (
  <Flex>
    <TextInput
      required
      label="Name"
      name="name"
      placeholder="e.g. Stephen King"
      {...form.getInputProps("name")}
    />
  </Flex>
);
