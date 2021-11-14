import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import ClickToCopy from "../ClickToCopy";
import Time from "../../utils/time";
import Link from "next/dist/client/link";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import _ from "lodash";
import useStore from "../../utils/store";
import { ViewBoardsIcon } from "@heroicons/react/outline";
export default function OpeningList() {
  const { user, isUserLoading, isUserError } = useSelf();
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings();

  const search = useStore((state) => state.openingsSearchInput);

  const filteredOpenings = openings?.filter((opening) =>
    opening.GSI1SK.toLowerCase().trim().includes(search.toLowerCase().trim())
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {filteredOpenings?.map((opening) => (
          <li key={opening.openingId}>
            {/* If the opening has stages, go to the first stage and view aplicants. Otherwise, go to the settings page for the opening to create one*/}
            <Link
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/openings/${
                opening.openingId
              }/${
                opening.totalStages > 0
                  ? `stages/${opening.stageOrder[0]}/applicants` // TODO should this end with applicants?
                  : `settings`
              }
              `}
            >
              <a className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg font-medium text-blue-600 truncate">
                      {opening.GSI1SK}
                    </h1>
                    <div className="ml-2 flex-shrink-0 flex">
                      {opening.isPublic ? (
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
                      <p className="flex items-center text-lg text-normal">
                        <UsersIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                          aria-hidden="true"
                        />
                        {opening.totalApplicants}
                      </p>
                      <p className="mt-2 flex items-center text-lg text-normal sm:mt-0 sm:ml-6">
                        <ViewBoardsIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                          aria-hidden="true"
                        />
                        {opening.totalStages}
                      </p>
                      {opening?.isPublic ? (
                        <p className="mt-2 flex items-center text-lg text-normal sm:mt-0 sm:ml-6">
                          <ClickToCopy
                            showText={"Application Link"}
                            copyText={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/${user?.orgId}/${opening?.openingId}/apply`}
                          />
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center text-md text-normal sm:mt-0">
                      <CalendarIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                        aria-hidden="true"
                      />
                      <p>
                        Created{" "}
                        <time dateTime={opening.createdAt}>
                          {Time.relative(opening.createdAt)}
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
