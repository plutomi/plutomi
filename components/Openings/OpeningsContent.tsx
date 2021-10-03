import OpeningList from "./OpeningsList";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import Loader from "../Loader";
import { useEffect } from "react";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
export default function OpeningsContent() {
  const router = useRouter();
  const { applicant_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  return isOpeningsLoading ? (
    <Loader text="Loading openings..." />
  ) : (
    <OpeningList />
  );
}
