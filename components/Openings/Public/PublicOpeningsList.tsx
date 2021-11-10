// Very similar to OpeningsList, but removes some elements
// Such as filtering of openings, their public / private status,
// And how many applicants there are
import { CalendarIcon, LocationMarkerIcon } from "@heroicons/react/solid";
import { getRelativeTime } from "../../../utils/time";
import Link from "next/dist/client/link";

import _ from "lodash";
import { useRouter } from "next/router";
import useStore from "../../../utils/store";
import useAllPublicOpenings from "../../../SWR/useAllPublicOpenings";
export default function PublicOpeningsList() {
  const router = useRouter();
  const { orgId } = router.query as CustomQuery;
  let { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(orgId);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {publicOpenings?.map((opening: DynamoOpening) => (
          <li key={opening.openingId}>
            {/* Take applicant to opening info page */}
            <Link
              href={`${process.env.WEBSITE_URL}/${orgId}/${opening?.openingId}/apply`}
            >
              <a className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-blue-600 truncate">
                      {opening.GSI1SK}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="mt-2 flex items-center text-lg text-normal sm:mt-0">
                        <LocationMarkerIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                          aria-hidden="true"
                        />
                        Location
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-md text-normal sm:mt-0">
                      <CalendarIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                        aria-hidden="true"
                      />
                      <p>
                        Posted{" "}
                        <time dateTime={opening.created_at as string}>
                          {getRelativeTime(opening.created_at)}
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
