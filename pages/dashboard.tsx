import NewPage from "../components/Templates/NewPage";
import DashboardContent from "../components/Dashboard/DashboardContent";
export default function NewDash() {
  return (
    <NewPage
      loggedOutPageText={"Log in to view your dashboard"}
      currentNavbarItem={"Dashboard"}
      headerText={"Dashboard"}
    >
      <DashboardContent />
    </NewPage>
  );
}
