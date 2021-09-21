import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";

export default function Funnels() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const name = user?.GSI1SK;

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
        <h1 className="text-4xl text-normal font-medium">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SignedInNav current="Funnels" user={user} />
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
            <button
              type="button"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Create a new funnel
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
