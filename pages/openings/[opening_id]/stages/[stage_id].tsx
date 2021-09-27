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

  // TODO call this
  const save = async (value, property) => {
    try {
      const body = {
        org_id: user.org_id,
        opening_id: opening_id,
        stage_id: stage_id,
        updated_stage: {
          ...stage,
          property: "beans",
        },
      };

      const { status, data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);
  };

  const DeleteStage = async (stage_id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this stage? THIS IS IRREVERSABLE!!!"
      )
    )
      return;
    try {
      await axios.delete(`/api/openings/${opening_id}/stages/${stage_id}`);
      alert("Deleted atage");
      router.push(`/openings/${opening_id}/stages`);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}`);
    mutate(`/api/openings/${opening_id}/stages`);
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
        <div>
          {stage ? (
            <div>
              <h1 className="text-2xl font-bold">{stage.GSI1SK}</h1>
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
            <h1> Loading stage</h1> // TODO now this is stuck
          ) : (
            <h1>No stage found</h1>
          )}
        </div>
      </div>
    </div>
  );
}
