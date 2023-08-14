import type { GetStaticProps, NextPage } from "next";

export const FiveHundred: NextPage = () => <h1>500 :( </h1>;

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default FiveHundred;
