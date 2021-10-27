import useSelf from "../SWR/useSelf";
import EmptyTeamState from "../components/Team/EmptyTeamState";
import TeamContent from "../components/Team/TeamContent";
import useOrgUsers from "../SWR/useOrgUsers";
import { useRouter } from "next/router";

import NewPage from "../components/Templates/NewPage";
export default function Team() {
  return (
    <NewPage
      loggedOutPageText={"Log in to view your team"}
      currentNavbarItem={"Team"}
      headerText={"Team"}
    >
      <TeamContent />
    </NewPage>
  );
}
