import { useSession } from "next-auth/client";
import useUser from "../SWR/useUser";

export default function SessionHandlig() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  if (!session) {
    return <h1>Sign in</h1>;
  }
  if (session && isUserLoading) {
    return <h1>Loading skeleton</h1>;
  }

  if (isUserError) {
    return <h1>An error ocurred signing you in, please sign in again</h1>;
  }

  if (session && user) {
    <div>Main Page goes here</div>;
  }
}
