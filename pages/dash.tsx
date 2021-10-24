import NewPage from "../components/Templates/NewPage";
export default function NewDash() {
  return (
    <NewPage
      desiredPageText={"your dashboard"}
      currentNavbarItem={"Dashboard"}
      headerText={"Dashboard"}
    >
      <h1>Content Goes Here</h1>
    </NewPage>
  );
}
