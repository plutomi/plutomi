import type { GetStaticProps, NextPage } from "next";
import { CreateOrgOnboarding, PageShell } from "@/components";

const Dashboard: NextPage = () => (
  <PageShell>
    <CreateOrgOnboarding />
  </PageShell>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Dashboard;
