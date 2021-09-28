import EmptyOpeningsState from "./EmptyOpeningsState";
import axios from "axios";
import { mutate } from "swr";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
export default function OpeningsContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  return (
    <>
      {openings.map((opening: DynamoOpening) => {
        return <h1 key={opening.opening_id}>{opening.GSI1SK}</h1>;
      })}
    </>
  );
}
