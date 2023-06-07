import { Button, TextInput, Flex } from "@mantine/core";

const FormItem = ({ children, setStep, form }) => {
  const handleClick = () => {
    if (form.validate().hasErrors) {
      console.log(`FORM HAS ERRORS`);
      console.log(JSON.stringify(form.errors, null, 2));
      return;
    }
    console.log("Setting next");
    setStep((prev) => prev + 1);
  };

  return (
    <div>
      {children}
      <Button onClick={handleClick}>Next CUSTOM</Button>
    </div>
  );
};

export const CustomStep = ({ form, setStep }: { form: any; setStep: any }) => {
  const x = "";
  return (
    <FormItem form={form} setStep={setStep}>
      <Flex>
        <TextInput
          required
          label="Name"
          name="name"
          placeholder="e.g. Stephen King"
          {...form.getInputProps("name")}
        />
      </Flex>
    </FormItem>
  );
};
