import { Container } from "@mantine/core";
import type { NextPage } from "next";
import { LogInOrSignUpForm } from "../components";

const Login: NextPage = () => (
  <Container my={40}>
    <LogInOrSignUpForm />
  </Container>
);

export default Login;
