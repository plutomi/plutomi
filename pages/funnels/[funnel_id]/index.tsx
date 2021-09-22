import { useState } from "react";
import SignedInNav from "../../../components/Navbar/SignedInNav";
import useFunnelById from "../../../SWR/useFunnelById";
import { GetRelativeTime } from "../../../utils/time";
import { useSession } from "next-auth/client";
import SignIn from "../../../components/SignIn";
import useUser from "../../../SWR/useUser";
import { useRouter } from "next/router";
export default function ViewFunnel() {
  const router = useRouter();
  const { funnel_id } = router.query;
  console.log("FUNNEL ID", funnel_id);
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { funnel, isFunnelLoading, isFunnelError } = useFunnelById(
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
      {funnel ? (
        <div>
          <h1 className="">{JSON.stringify(funnel)}</h1>
          <div className="mx-auto max-w-7xl p-20">Stages will go here</div>
        </div>
      ) : (
        <h1>No funnel found by that ID</h1>
      )}
    </div>
  );
}
