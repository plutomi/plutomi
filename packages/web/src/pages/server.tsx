import axios from "axios";
import type { InferGetServerSidePropsType, NextPage } from "next";
// import { LogInOrSignUpForm } from "../components";

const Login = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
   <div>Login - {data.message} s</div>
);


export const getServerSideProps = async () => {
   const { data }: { data: { message: string } } = await axios.get('/api/hello')

   return {
      props: {
         data
      }
   }
}
export default Login;
