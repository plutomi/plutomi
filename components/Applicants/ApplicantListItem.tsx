import { getRelativeTime } from "../../utils/time";
import { CalendarIcon } from "@heroicons/react/outline";
import ClickToCopy from "../ClickToCopy";

export default function ApplicantListItem({ applicant, handleApplicantClick }) {
  return (
    <li
      className="cursor-pointer"
      onClick={(e) => handleApplicantClick(applicant.applicantId)}
    >
      {/* If the opening has stages, go to the first stage and view aplicants. Otherwise, go to the settings page for the opening to create one*/}
      <a className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-blue-600 truncate">
              {applicant.fullName}
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
                  {getRelativeTime(applicant.created_at)}
                </time>
              </p>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
}
