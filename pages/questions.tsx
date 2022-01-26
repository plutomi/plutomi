import NewPage from "../components/Templates/NewPage";
import QuestionsContent from "../components/Questions/QuestionsContent";
export default function Questions() {
  return (
    <NewPage
      loggedOutPageText={"Log in to view your questions"}
      currentNavbarItem={"Questions"}
      headerText={"Questions"}
    >
      <QuestionsContent />
    </NewPage>
  );
}
