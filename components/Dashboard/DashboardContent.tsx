import EmptyOrgState from "./EmptyOrgState";
export default function DashboardContent({ user }) {
  if (user.org_id === "NO_ORG_ASSIGNED") {
    return <EmptyOrgState />;
  }

  return <div>You&apos;re already in an org!</div>;
}
