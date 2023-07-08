import { CreateOrgOnboarding, PageShell } from "@/components";
import type { GetStaticProps, NextPage } from "next";

const Dashboard: NextPage = () => (
  <PageShell>
    <CreateOrgOnboarding />
  </PageShell>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Dashboard;
