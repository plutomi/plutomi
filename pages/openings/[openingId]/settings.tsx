import OpeningSettingsHeader from "../../../components/Openings/OpeningSettingsHeader";
import OpeningSettingsContent from "../../../components/Openings/OpeningSettingsContent";
import NewPage from "../../../components/Templates/NewPage";
import { useRouter } from "next/router";
import useSelf from "../../../SWR/useSelf";
import useOpeningById from "../../../SWR/useOpeningById";
import { CUSTOM_QUERY } from "../../../types/main";
export default function OpeningSettings() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CUSTOM_QUERY, "openingId">;
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);
  return (
    <NewPage
      loggedOutPageText={"Log in to view your opening settings"}
      currentNavbarItem={"Openings"}
      headerText={
        isOpeningLoading ? "Settings" : `${opening?.GSI1SK} - Settings`
      }
    >
      <>
        <OpeningSettingsHeader />
        <OpeningSettingsContent />
      </>
    </NewPage>
  );
}
