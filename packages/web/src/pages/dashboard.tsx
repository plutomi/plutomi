import type { NextPage } from "next";
import { CreateOrgOnboarding, PageShell } from "../components";

const Dashboard: NextPage = () => (
  <PageShell>
    <CreateOrgOnboarding />
  </PageShell>
);

export default Dashboard;
