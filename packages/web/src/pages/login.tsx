import { Container } from "@mantine/core";
import type { GetStaticProps, NextPage } from "next";
import { LogInOrSignUpForm } from "../components";

const Login: NextPage = () => (
  <Container my={40}>
    <LogInOrSignUpForm />
  </Container>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Login;
