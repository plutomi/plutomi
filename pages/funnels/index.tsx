import { useSession } from "next-auth/client";
import SignIn from "../../components/SignIn";
import useUser from "../../SWR/useUser";
import UserProfileCard from "../../components/UserProfileCard";
import SignedInNav from "../../components/Navbar/SignedInNav";
import useStore from "../../utils/store";
import Link from "next/dist/client/link";
import CreateFunnelModal from "../../components/CreateFunnelModal";
import useFunnels from "../../SWR/useFunnels";
import { GetRelativeTime } from "../../utils/time";
import { useState, useEffect } from "react";
export default function Funnels() {
  const [search, setSearch] = useState("");
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  let { funnels, isFunnelsLoading, isFunnelsError } = useFunnels(
    session?.user_id
  );

  let filteredFunnels = funnels?.filter((funnel) =>
    funnel.funnel_name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const setCreateFunnelModalOpen = useStore(
    (state: NewSate) => state.setCreateFunnelModalOpen
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
    <div className="min-h-screen bg-white">
      <SignedInNav current="Funnels" user={user} />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content */}
          </div>
        </header>
        <UserProfileCard user={user} />

        <main>
          <CreateFunnelModal />

          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setCreateFunnelModalOpen(true)}
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500"
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
            <div className="max-w-xl my-2 mx-auto">
              <label
                htmlFor="funnel"
                className="block text-sm font-medium text-gray-700"
              >
                Search
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="funnel"
                  id="funnel"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="'Engineer' or 'New York'"
                />
              </div>
            </div>

            <div>
              {filteredFunnels?.length > 0 ? (
                filteredFunnels.map((funnel) => {
                  return (
                    <div
                      key={funnel.funnel_id}
                      className="border my-4 p-4 hover:bg-blue-gray-100 rounded-lg border-blue-gray-400"
                    >
                      <Link href={`/funnels/${funnel.funnel_id}`}>
                        <a>
                          <h1 className="font-bold text-xl text-normal my-2">
                            {funnel.funnel_name}
                          </h1>
                          <p className="text-normal text-lg ">
                            Created {GetRelativeTime(funnel.created_at)}
                          </p>
                          <p className="text-light text-lg ">
                            {" "}
                            Apply link:{" "}
                            {`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${user.org_id}/${funnel.funnel_id}/apply`}
                          </p>
                        </a>
                      </Link>
                    </div>
                  );
                })
              ) : isFunnelsLoading ? (
                <h1>Loading...</h1>
              ) : (
                <h1>No funnels found</h1>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
