import OpeningList from "./OpeningsList";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import Loader from "../Loader";
import { useRouter } from "next/router";
export default function OpeningsContent() {
  const router = useRouter();
<<<<<<< HEAD
<<<<<<< HEAD
  const { applicant_id } = router.query as CustomQuery;
=======
  const { applicant_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
  const { applicant_id } = router.query as CustomQuery;
>>>>>>> ce0b1d8 (fix: Removed all 'as string' - #196)

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
