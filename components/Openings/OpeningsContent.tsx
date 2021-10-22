import OpeningList from "./OpeningsList";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import Loader from "../Loader";
import { useRouter } from "next/router";
export default function OpeningsContent() {
  const router = useRouter();
  const { applicant_id } = router.query;

  const { user, isUserLoading, isUserError } = useSelf();
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  return isOpeningsLoading ? (
    <Loader text="Loading openings..." />
  ) : (
    <OpeningList />
  );
}
