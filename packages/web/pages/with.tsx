import type { GetStaticProps, NextPage } from "next";

const With: NextPage = () => (
  <div>
    <h1>Second Page With Get Static Props - updated</h1>
  </div>
);

export const getStaticProps: GetStaticProps = async () => ({
  props: {}
});

export default With;
