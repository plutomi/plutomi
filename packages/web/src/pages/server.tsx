 import type { InferGetServerSidePropsType } from "next";
import { API } from "../utils/axiosInstance";

const Test = ({ data: { message} }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
   <div>Login - {message} s</div>
);


export const getServerSideProps = async () => {
   // TODO: Remove - just testing
   const { data }: { data: { message: string } } = await API.get("/ssr");

   return {
      props: {
         data
      }
   }
}
export default Test;




