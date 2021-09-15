import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";

export default function NewPage() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const name = user?.GSI1SK;
  return (
    <>
      {isUserLoading ? (
        <p className="mx-auto text-center text-blue-gray-600 text-lg">
          Loading user... {/* Loading skeleton PLACEHOLDER */}
        </p>
      ) : !session || isUserError ? (
        <SignIn
          callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/PLACEHOLDER`} // Actual URL
          desiredPage={"PLACEHOLDER"} // 'your dashboard' // 'your settings'
        />
      ) : (
        <div className="min-h-screen bg-white">
          <SignedInNav current={"PLACEHOLDER"} user={user} />
          <div className="py-10">
            <header>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Content */}
              </div>
            </header>
            <UserProfileCard user={user} /> {/* Debugging */}
            <main>
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Content */}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
