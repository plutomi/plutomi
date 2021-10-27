import OpeningSettingsHeader from "../../../components/Openings/OpeningSettingsHeader";
import OpeningSettingsContent from "../../../components/Openings/OpeningSettingsContent";
import NewPage from "../../../components/Templates/NewPage";
import { useRouter } from "next/router";
import useSelf from "../../../SWR/useSelf";
import useOpeningById from "../../../SWR/useOpeningById";
export default function OpeningSettings() {
  const router = useRouter();
  const { opening_id } = router.query as CustomQuery;
  let { opening, isOpeningLoading, isOpeningError } =
    useOpeningById(opening_id);
  return (
    <NewPage
      loggedOutPageText={"Log in to view your opening settings"}
      currentNavbarItem={"Openings"}
      headerText={
        isOpeningLoading ? "Settings" : `${opening.GSI1SK} - Settings`
      }
    >
      <>
        <OpeningSettingsHeader />
        <OpeningSettingsContent />
      </>
    </NewPage>
  );
}
