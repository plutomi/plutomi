import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import AlreadySignedIn from "../components/AlreadySignedIn";
import Dash from "../components/Dash";
import useUser from "../SWR/useUser";
import UserProfileCard from "../components/UserProfileCard";
export default function Dashboard() {
  const [session]: CustomSession = useSession();

  const { user, isLoading, isError } = useUser(session?.user_id);
  return (
    <div>
      {session ? (
        <div>
          <AlreadySignedIn />
          <UserProfileCard user={user} />
          <Dash name={user?.GSI1SK} />
        </div>
      ) : (
        <SignIn callbackUrl={`${process.env.NEXTAUTH_URL}/dashboard`} />
      )}
    </div>
  );
}
