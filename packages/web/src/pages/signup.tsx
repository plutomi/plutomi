import { Container } from "@mantine/core";
import type { GetStaticProps, NextPage } from "next";
import { LogInOrSignUpForm } from "../components";

const SignUp: NextPage = () => (
  <Container my={40}>
    <LogInOrSignUpForm />
  </Container>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default SignUp;
