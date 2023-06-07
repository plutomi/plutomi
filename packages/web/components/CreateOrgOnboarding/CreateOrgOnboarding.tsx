import { useState } from "react";
import { Container, Card } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Schema } from "@/../validation";
import { CustomStep } from "./CustomStep";

export const CreateOrgOnboarding: React.FC = () => {
  const [step, setStep] = useState(0);

  const form = useForm<Schema.Orgs.post.UIValues>({
    initialValues: {
      name: "",
      customWorkspaceId: ""
    },
    validate: zodResolver(Schema.Orgs.post.UISchema)
  });

  return (
    <Container size="sm" p={40} mt={40}>
      <Card withBorder shadow="sm" radius="md">
        <form>
          {step === 0 && <CustomStep form={form} setStep={setStep} />}
          {step === 1 && <h1>STEP 2</h1>}
        </form>

        {/* {active === 0 ? <CustomStep form={form} /> : null}
          {active === 1 ? (
            <TextInput
              label="Workspace ID"
              placeholder="plutomi.com/your-workspace-id"
              description="Create a custom ID where your applicants can apply to."
              {...form.getInputProps("customWorkspaceId")}
            />
          ) : null} */}
        {/* <Stepper active={active} breakpoint="sm" orientation="horizontal">
            <Stepper.Step label="Org Setup"></Stepper.Step>

            <Stepper.Step label="Workspace Setup">
     
            </Stepper.Step>

            <Stepper.Completed>
              Completed! Form values:
              <Code block mt="xl">
                {JSON.stringify(form.values, null, 2)}
              </Code>
            </Stepper.Completed>
          </Stepper> */}

        {/* <Group position="right" mt="xl">
          {active !== 0 && (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}
          {active !== 2 && <Button onClick={nextStep}>Next</Button>}
        </Group> */}
      </Card>
    </Container>
  );
};
