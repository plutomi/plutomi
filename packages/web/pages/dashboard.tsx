import { DashboardContent } from "@/components/Dashboard";
import { PageShell } from "@/components/PageShell";
import type { NextPage } from "next";

const Dashboard: NextPage = () => (
  <PageShell>
    <DashboardContent />
  </PageShell>
);

export default Dashboard;
