import { DashboardContent } from "@/components/Dashboard";
import { PageShell } from "@/components/PageShell";
import type { GetStaticProps, NextPage } from "next";

const Dashboard: NextPage = () => (
  <PageShell>
    <DashboardContent />
  </PageShell>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Dashboard;
