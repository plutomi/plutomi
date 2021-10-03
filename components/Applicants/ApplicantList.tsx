import {
  CalendarIcon,
  LocationMarkerIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import ClickToCopy from "../ClickToCopy";
import { GetRelativeTime } from "../../utils/time";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import _ from "lodash";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
import Loader from "../Loader";
import useAllApplicantsInStage from "../../SWR/useAllApplicantsInStage";
import { AtSymbolIcon } from "@heroicons/react/outline";
export default function ApplicantList() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const { applicants, isApplicantsLoading, isApplicantsError } =
    useAllApplicantsInStage(opening_id as string, stage_id as string);

  if (isApplicantsLoading) {
    return <Loader text="Loading applicants..." />;
  }

  if (applicants.length == 0) {
    return (
      <h1 className="text-2xl font-semibold text-normal">
        No applicants in this stage
      </h1>
    );
  }
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {applicants?.map((applicant: DynamoApplicant) => (
          <li key={applicant.applicant_id}>
            {/* If the opening has stages, go to the first stage and view aplicants. Otherwise, go to the settings page for the opening to create one*/}

            <a className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-medium text-blue-600 truncate">
                    {applicant.full_name}
                  </h1>
                  <div className="ml-2 flex-shrink-0 flex">
                    {applicant.email_verified ? (
                      <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Email Verified
                      </p>
                    ) : (
                      <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-gray-100 text-blue-gray-800">
                        Pending Verification
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-lg text-normal">
                      {applicant.email}
                    </p>
                    {/* <p className="mt-2 flex items-center text-lg text-normal sm:mt-0 sm:ml-6">
                      <LocationMarkerIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                        aria-hidden="true"
                      />
                      Location
                    </p> */}
                    <p className="mt-2 flex items-center text-lg text-normal sm:mt-0 sm:ml-2 ">
                      <ClickToCopy
                        showText={"Copy Email"}
                        copyText={applicant.email}
                      />
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-md text-normal sm:mt-0">
                    <CalendarIcon
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-light"
                      aria-hidden="true"
                    />
                    <p>
                      Applied{" "}
                      <time dateTime={applicant.created_at}>
                        {GetRelativeTime(applicant.created_at)}
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
