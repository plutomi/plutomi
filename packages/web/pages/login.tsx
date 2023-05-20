import { LogInOrSignUpForm } from "@/components/LogInOrSignUp";
import { Container } from "@mantine/core";
import type { NextPage } from "next";

const Login: NextPage = () => (
  <Container my={40}>
    <LogInOrSignUpForm />
  </Container>
);

export default Login;
