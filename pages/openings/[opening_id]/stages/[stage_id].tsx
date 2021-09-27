import SignedInNav from "../../../../components/Navbar/SignedInNav";
import useStageById from "../../../../SWR/useStageById";
import SignIn from "../../../../components/SignIn";
import useUser from "../../../../SWR/useUser";
import { useSession } from "next-auth/client";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { useRouter } from "next/router";
import axios from "axios";
import { mutate } from "swr";
import { useState } from "react";
import useOpenings from "../../../../SWR/useOpenings";
import useOpeningById from "../../../../SWR/useOpeningById";
export default function Stage() {
  const router = useRouter();
  const { stage_id, opening_id } = router.query;
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    session?.user_id,
    opening_id as string
  );

  const { stage, isStageLoading, isStageError } = useStageById(
    session?.user_id,
    opening_id as string,
    stage_id as string
  );

  const pages = [
    {
      name: "Openings",
      href: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`,
      current: false,
    },
    {
      name: opening?.GSI1SK || "loading...",
      href: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/stages`,
      current: false,
    },
    {
      name: stage?.GSI1SK || "loading...",
      href: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/${stage?.stage_id}`,
      current: true,
    },
  ];

  // TODO call this
  const updateStage = async (stage_id: string) => {
    try {
      const body = {
        updated_stage: {
          ...stage,
          GSI1SK: newName ? newName : opening.GSI1SK, // If not blank
        },
      };

      const { data } = await axios.put(
        `/api/openings/${opening_id}/stages/${stage_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(`/api/openings/${opening_id}/stages/${stage_id}`);
    setIsEditing(false);
    setNewName("");
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
      alert("Deleted stage");
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
      <div className="mx-auto px-20 py-8">
        <div>
          <Breadcrumbs pages={pages} />
          {stage ? (
            <div className="p-10">
              <h1 className="text-2xl font-bold">{stage.GSI1SK}</h1>
              <div className="m-4  flex flex-wrap max-w-full">
                <button
                  className="px-4 py-3 bg-red-500 m-4 text-white text-xl hover:bg-red-800"
                  onClick={() => DeleteStage(stage.stage_id)}
                >
                  Delete{" "}
                </button>
                <button
                  className="px-4 py-3 bg-sky-500 m-4 text-white text-xl hover:bg-sky-800"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Edit{" "}
                </button>
              </div>
              {isEditing ? (
                <div className="max-w-xl my-2 mx-auto ">
                  <label
                    htmlFor="newName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Change name{" "}
                    {!newName || newName === stage.GSI1SK ? (
                      <span className="text-sm text-blue-gray-500">
                        - Name will stay the same
                      </span>
                    ) : null}
                  </label>
                  <div className="mt-1 space-y-4">
                    <input
                      type="text"
                      name="newName"
                      id="newName"
                      defaultValue={stage.GSI1SK}
                      // value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter your new name here"
                    />

                    <button
                      onClick={() => updateStage(stage.stage_id)}
                      className=" px-4 py-3 text-white bg-green-500 rounded-lg"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : null}
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
