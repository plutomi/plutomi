import { useState } from "react";
import SignedInNav from "../../../components/Navbar/SignedInNav";
import useFunnelById from "../../../SWR/useFunnelById";
import { GetRelativeTime } from "../../../utils/time";
import CreateStageModal from "../../../components/CreateStageModal";
import { useSession } from "next-auth/client";
import useStagesInFunnel from "../../../SWR/useStagesInFunnel";
import SignIn from "../../../components/SignIn";
import Link from "next/dist/client/link";
import useStore from "../../../utils/store";
import useUser from "../../../SWR/useUser";
import { useRouter } from "next/router";
export default function ViewFunnel() {
  const router = useRouter();
  const { funnel_id } = router.query;
  console.log("FUNNEL ID", funnel_id);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const setCreateStageModalOpen = useStore(
    (state: PlutomiState) => state.setCreateStageModalOpen
  );

  let { funnel, isFunnelLoading, isFunnelError } = useFunnelById(
    session?.user_id,
    funnel_id as string
  );

  const { stages, isStagesLoading, isStagesError } = useStagesInFunnel(
    session?.user_id,
    funnel_id as string
  );
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/funnels`}
        desiredPage={"your funnels"}
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
      <SignedInNav user={user} current={"Funnels"} />
      <div className="mx-auto max-w-md p-20 ">
        <h1 className="text-xl font-bold text-normal">{funnel?.funnel_name}</h1>
        <p className="text-light text-lg">
          Created {GetRelativeTime(funnel?.created_at)}
        </p>
      </div>
      <button
        onClick={() => setCreateStageModalOpen(true)}
        className="mx-auto flex justify-center items-center px-4 py-2 bg-blue-700 m-2 rounded-lg text-white"
      >
        + Add stage
      </button>
      <CreateStageModal funnel_id={funnel_id as string} />
      {funnel ? (
        <div>
          <h1 className="">{JSON.stringify(funnel)}</h1>
          <div className="mx-auto max-w-7xl p-20">
            <h1>Stages will go here</h1>

            <div>
              {stages?.length > 0 ? (
                stages.map((stage) => {
                  return (
                    <div
                      key={stage.stage_id}
                      className="border my-4 p-4 hover:bg-blue-gray-100 rounded-lg border-blue-gray-400"
                    >
                      <Link
                        href={`/funnels/${funnel_id}/stage/${stage.stage_id}`}
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
                            {`https://${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${user.org_id}/${funnel.funnel_id}/apply`}
                          </p> */}
                        </a>
                      </Link>
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
        <h1>No funnel found by that ID</h1>
      )}
    </div>
  );
}
