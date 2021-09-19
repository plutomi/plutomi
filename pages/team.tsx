import { PlusSmIcon } from "@heroicons/react/solid";
import axios from "axios";
import { GetRelativeTime } from "../utils/time";
import { FormEvent, useState } from "react";

import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";

import useOrgUsers from "../SWR/useOrgUsers";

export default function Team() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const name = user?.GSI1SK;

  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id
  );
  const [recipient, setRecipient] = useState("");

  const sendInvite = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // TODO add custom expiry - Defaults to 3 days
      const body = {
        recipient: recipient,
      };
      const { status, data } = await axios.post(
        `/api/orgs/${user.org_id}/invite`,
        body
      );
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <>
      {isUserLoading ? (
        <p className="mx-auto text-center text-blue-gray-600 text-lg">
          Loading user... {/* Loading skeleton PLACEHOLDER */}
        </p>
      ) : !session || isUserError ? (
        <SignIn
          callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/team`} // Actual URL
          desiredPage={"your team"} // 'your dashboard' // 'your settings'
        />
      ) : (
        <div className="min-h-screen bg-white">
          <SignedInNav current={"Team"} user={user} />
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
                <div>
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h2 className="mt-2 text-lg font-medium text-gray-900">
                      Add team members
                    </h2>
                    <p className="mt-1 text-sm text-blue-gray-500">
                      An email will be sent to the user, they&apos;ll have{" "}
                      <span className="font-bold">3</span> days to accept.
                    </p>
                  </div>
                  <form className="mt-6 flex" onSubmit={(e) => sendInvite(e)}>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      required
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter an email"
                    />
                    <button
                      type="submit"
                      className="ml-4 flex-shrink-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Send invite
                    </button>
                  </form>
                </div>
                <div className="mx-auto p-4">
                  <h1 className="text-xl font-bold text-normal">
                    Your current team
                  </h1>

                  {/* {isOrgUsersLoading ? <h1>Org users loading</h1> : null}
        {isOrgUsersError ? <h1>Org users ERROR</h1> : null} */}

                  <ul className="border p-4">
                    {orgUsers?.map((user: DynamoUser) => {
                      return (
                        <li
                          className="shadow-md p-4 my-2 border rounded-md"
                          key={user?.user_id}
                        >
                          <h4>
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <p>{user?.user_email}</p>
                          <p>Joined {GetRelativeTime(user?.org_join_date)}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
