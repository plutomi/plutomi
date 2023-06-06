import { useState } from "react";
import {
  Stepper,
  Button,
  Group,
  TextInput,
  Code,
  Container
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Schema } from "@/../validation";

export const CreateOrgOnboarding: React.FC = () => {
  const [active, setActive] = useState(0);

  const form = useForm<Schema.Orgs.post.UIValues>({
    initialValues: {
      name: "",
      customWorkspaceId: ""
    },

    validate: () => {
      if (active === 0) {
        return zodResolver(Schema.Orgs.post.UIOrgStepSchema);
      }

      if (active === 1) {
        return zodResolver(Schema.Orgs.post.UIWorkspaceIdStepSchema);
      }

      // Should never happen
      return {};
    }
  });

  const nextStep = () => {
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < 2 ? current + 1 : current;
    });
  };

  const prevStep = () => {
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <Container size="md" p={40} mt={40}>
      <Stepper active={active} breakpoint="sm">
        <Stepper.Step label="Org Setup" description="Organization Name">
          <TextInput
            label="Organization Name"
            placeholder="Plutomi Inc."
            {...form.getInputProps("name")}
          />
        </Stepper.Step>

        <Stepper.Step label="Workspace Setup" description="Choose a custom ID">
          <TextInput
            label="Workspace ID"
            placeholder="plutomi.com/your-workspace-id"
            {...form.getInputProps("customWorkspaceId")}
          />
        </Stepper.Step>

        <Stepper.Completed>
          Completed! Form values:
          <Code block mt="xl">
            {JSON.stringify(form.values, null, 2)}
          </Code>
        </Stepper.Completed>
      </Stepper>

      <Group position="right" mt="xl">
        {active !== 0 && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        {active !== 3 && <Button onClick={nextStep}>Next step</Button>}
      </Group>
    </Container>
  );
};
