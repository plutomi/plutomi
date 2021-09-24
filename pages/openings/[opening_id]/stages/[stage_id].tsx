import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useStageById from "../../../../SWR/useStageById";
import SignIn from "../../../../components/SignIn";
import useUser from "../../../../SWR/useUser";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import axios from "axios";
import { mutate } from "swr";
export default function Stage() {
  const router = useRouter();
  const { stage_id, opening_id } = router.query;

  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const { stage, isStageLoading, isStageError } = useStageById(
    session?.user_id,
    opening_id as string,
    stage_id as string
  );

  const DeleteStage = async (stage_id: string) => {
    try {
      await axios.delete(`/api/openings/${opening_id}/stages/${stage_id}`);
      alert("Deleted atage");
      router.push(`/openings/${opening_id}/stages`);
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
                <button
                  onClick={(e) => DeleteStage(stage.stage_id)}
                  className="bg-red-500 px-5 py-3 text-white"
                >
                  Delete Stage
                </button>
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
