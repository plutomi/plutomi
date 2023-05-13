import { Flex, Button } from "@mantine/core";
import { BsGithub, BsTwitter } from "react-icons/bs";

export const SocialButtons: React.FC = () => (
  <Flex gap="xl" justify="center" align="center" direction="row" wrap="wrap">
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
      href="https://twitter.com/notjoswayski"
      rel="noopener noreferrer"
      target="_blank"
      variant="default"
      radius="md"
      rightIcon={<BsTwitter size="1.1rem" color="#00acee" />}
    >
      Jose on Twitter
    </Button>
  </Flex>
);
