import OpeningList from "./OpeningsList";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import Loader from "../Loader";
import { useRouter } from "next/router";
export default function OpeningsContent() {
  const router = useRouter();
<<<<<<< HEAD
  const { applicant_id } = router.query as CustomQuery;
=======
  const { applicant_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)

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
