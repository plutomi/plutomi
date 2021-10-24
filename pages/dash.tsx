import NewPage from "../components/Templates/NewPage";
import DashboardContent from "../components/Dashboard/DashboardContent";
export default function NewDash() {
  return (
    <NewPage
      desiredPageText={"your dashboard"}
      currentNavbarItem={"Dashboard"}
      headerText={"Dashboard"}
    >
      <DashboardContent />
    </NewPage>
  );
}
