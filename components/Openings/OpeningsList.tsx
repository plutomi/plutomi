import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import { GetRelativeTime } from "../../utils/time";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import _ from "lodash";
import useStore from "../../utils/store";
export default function OpeningList() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const search = useStore((state: PlutomiState) => state.openingsSearchInput);

  const filtered_openings = openings.filter((opening: DynamoOpening) =>
    opening.GSI1SK.toLowerCase().trim().includes(search.toLowerCase().trim())
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {filtered_openings?.map((opening: DynamoOpening) => (
          <li key={opening.opening_id}>
            {/* This looks complicated, but all it's doing is checking if there
            are stages in the opening. If not, redirect the user to create a
        stage first */}
            <Link
              href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${
                opening.opening_id
              }/stages${
                opening.stage_order[0] ? `/${opening.stage_order[0]}` : ""
              }`}
            >
              <a className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-blue-600 truncate">
                      {opening.GSI1SK}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      {opening.is_public ? (
                        <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Public
                        </p>
                      ) : (
                        <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-gray-100 text-blue-gray-800">
                          Private
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-lg text-gray-500">
                        <UsersIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        {_.random(10, 500)}
                      </p>
                      <p className="mt-2 flex items-center text-lg text-gray-500 sm:mt-0 sm:ml-6">
                        <LocationMarkerIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Location
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-gray-500 sm:mt-0">
                      <CalendarIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <p>
                        Created{" "}
                        <time dateTime={opening.created_at}>
                          {GetRelativeTime(opening.created_at)}
                        </time>
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
