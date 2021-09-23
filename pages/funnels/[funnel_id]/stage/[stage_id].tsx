import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useStageById from "../../../../SWR/useStageById";
import SignIn from "../../../../components/SignIn";
import useUser from "../../../../SWR/useUser";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
export default function Stage() {
  const router = useRouter();
  const { stage_id, funnel_id } = router.query;

  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const { stage, isStageLoading, isStageError } = useStageById(
    session?.user_id,
    funnel_id as string,
    stage_id as string
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
      <div className="mx-auto p-20">
        <h1 className="text-norm text-xl">
          Viewing individual stage - {stage_id}
        </h1>
        <div>
          {stage ? (
            <div>
              <div>{JSON.stringify(stage)}</div>
              <div className="mx-auto p-20 border rounded-md">
                <h1>Applicants will go here </h1>
              </div>
            </div>
          ) : isStageLoading ? (
            <h1> Loading stage</h1>
          ) : (
            <h1>No stage found</h1>
          )}
        </div>
      </div>
    </div>
  );
}
