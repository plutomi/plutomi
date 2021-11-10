import { CheckIcon, XCircleIcon } from "@heroicons/react/outline";
import { getRelativeTime } from "../../utils/time";
export default function Invite({ invite, acceptInvite, rejectInvite }) {
  return (
    <li
      key={invite.email}
      className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
    >
      <div className="w-full flex items-center justify-between px-6 py-3 space-x-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3 justify-between">
            <h3 className="text-dark text-lg font-semibold truncate">
              {invite.org_name}
            </h3>
            <span className="flex-shrink-0 inline-block px-2 py-0.5 text-blue-gray-800 text-xs font-medium bg-blue-gray-100 rounded-full">
              Expires {GetRelativeTime(invite.expires_at)}
            </span>
          </div>
          <p className="mt-2 text-normal text-sm truncate">
            {" "}
            Invited by{" "}
            <span className=" text-darkfont-semibold">
              {invite.created_by.first_name} {invite.created_by.last_name}
            </span>
          </p>
        </div>
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="w-0 flex-1 flex">
            <button
              onClick={() => acceptInvite(invite)}
              className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-md text-emerald-600 font-semibold  hover:text-white border-emerald-200 hover:bg-emerald-500 transition ease-in-out duration-200 border  rounded-bl-lg "
            >
              <CheckIcon className="w-5 h-5 " aria-hidden="true" />
              <span className="ml-3">Accept</span>
            </button>
          </div>
          <div className="-ml-px w-0 flex-1 flex">
            <button
              onClick={() => rejectInvite(invite)}
              className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-md text-red-600 font-semibold  hover:text-white border-red-200 hover:bg-red-500 transition ease-in-out duration-200 border border-transparent rounded-br-lg "
            >
              <XCircleIcon className="w-5 h-5 " aria-hidden="true" />
              <span className="ml-3">Reject</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
