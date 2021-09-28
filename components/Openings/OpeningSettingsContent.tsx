import OpeningList from "./OpeningsList";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import { useRouter } from "next/router";
import StageCard from "../Stages/StageCard";
import Loader from "../Loader";
import useUser from "../../SWR/useUser";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningById from "../../SWR/useOpeningById";
export default function OpeningSettingsContent() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening?.opening_id
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    return <Loader text="Loading stages..." />;
  }

  return (
    <>
      {stages?.map((stage: DynamoStage) => (
        <div
          key={stage?.stage_id}
          className="my-4 p-4 text-md shadow-md border max-w-md rounded-md"
        >
          {stage?.GSI1SK}
        </div>
      ))}
    </>
  );
}
