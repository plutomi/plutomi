import { CreateOrgOnboarding, DashboardContent, PageShell } from "@/components";
import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import type { GetStaticProps, NextPage } from "next";

const Dashboard: NextPage = () => (
  <PageShell>
    <CreateOrgOnboarding />
  </PageShell>
  // <PageShell navbar={<DashboardNavbar />}>
  //   <DashboardContent />
  // </PageShell>
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Dashboard;
