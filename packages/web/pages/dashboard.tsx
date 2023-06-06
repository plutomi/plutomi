import { DashboardContent, PageShell } from "@/components";
import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import type { GetStaticProps, NextPage } from "next";

const Dashboard: NextPage = () => (
  <PageShell
    appShellProps={{
      navbarOffsetBreakpoint: "sm",
      asideOffsetBreakpoint: "sm",
      navbar: <DashboardNavbar />,
      children: <DashboardContent />
    }}
  />
);

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Dashboard;
