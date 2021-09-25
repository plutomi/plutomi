import CreateStageModal from "../../../../components/CreateStageModal";
import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useAllStagesInOpening from "../../../../SWR/useAllStagesInOpening";
import useOpeningById from "../../../../SWR/useOpeningById";
import { GetRelativeTime } from "../../../../utils/time";
import SignIn from "../../../../components/SignIn";
import { useSession } from "next-auth/client";
import useStore from "../../../../utils/store";
import { mutate } from "swr";
import useUser from "../../../../SWR/useUser";
import Link from "next/dist/client/link";
import { useRouter } from "next/router";
import axios from "axios";
export default function ViewOpening() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const setCreateStageModalOpen = useStore(
    (state: PlutomiState) => state.setCreateStageModalOpen
  );
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  console.log("Opening component id", opening_id);
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    session?.user_id,
    opening_id as string
  );

  const DeleteStage = async (stage_id: string) => {
    try {
      await axios.delete(`/api/openings/${opening_id}/stages/${stage_id}`);
      alert("SSStage deleted");
      mutate(`/api/openings/${opening_id}/stages`);
    } catch (error) {
      alert(`Error deleting stage ${error.response.data.message}`);
    }
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`}
        desiredPage={"your openings"}
      />
    );
  }

  if (isUserLoading) {
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <SignedInNav user={user} current={"Openings"} />
      <div className="mx-auto max-w-md p-20 ">
        <h1 className="text-xl font-bold text-normal">
          {opening?.opening_name}
        </h1>
        <p className="text-light text-lg">
          Created {GetRelativeTime(opening?.created_at)}
        </p>
      </div>
      <button
        onClick={() => setCreateStageModalOpen(true)}
        className="mx-auto flex justify-center items-center px-4 py-2 bg-blue-700 m-2 rounded-lg text-white"
      >
        + Add stage
      </button>
      <CreateStageModal opening_id={opening_id as string} />
      {opening ? (
        <div>
          <h1 className="">{JSON.stringify(opening)}</h1>
          <div className="mx-auto max-w-7xl p-20">
            <h1>Stages will go here</h1>

            <div>
              {stages?.length > 0 ? (
                stages.map((stage) => {
                  return (
                    <div
                      key={stage.stage_id}
                      className="flex justify-center items-center"
                    >
                      <div className="border w-2/3 my-4 p-4 hover:bg-blue-gray-100 rounded-lg border-blue-gray-400">
                        <Link
                          href={`/openings/${opening_id}/stages/${stage.stage_id}`}
                        >
                          <a>
                            <h1 className="font-bold text-xl text-normal my-2">
                              {stage.stage_name}
                            </h1>
                            <p className="text-normal text-lg ">
                              Created {GetRelativeTime(stage.created_at)}
                            </p>

                            {/* <p className="text-light text-lg ">
                            {" "}
                            Apply link:{" "}
                            {`https://${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${user.org_id}/${opening.opening_id}/apply`}
                          </p> */}
                          </a>
                        </Link>
                      </div>
                      <button
                        onClick={(e) => DeleteStage(stage.stage_id)}
                        className="bg-red-500 px-5 py-3 text-white m-8 rounded-lg p-4"
                      >
                        Delete Stage
                      </button>
                    </div>
                  );
                })
              ) : isStagesLoading ? (
                <h1>Loading...</h1>
              ) : (
                <h1>No stages found</h1>
              )}
            </div>
          </div>
        </div>
      ) : (
        <h1>No opening found by that ID</h1>
      )}
    </div>
  );
}
