import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";

export default function Box({ stage_title, num_applicants, className }) {
  return (
    <div className={className}>
      <div className="relative text-center bg-white  py-5   sm:py-6 sm:px-3 shadow-md rounded-xl overflow-hidden">
        <dt>
          <p className=" text-lg font-medium text-dark">{stage_title}</p>
        </dt>
        <dd className="flex items-center  justify-center">
          <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
            <UserGroupIcon className="w-5 h-5 0" />
            <p className="text-xl font-semibold ">
              <NumberFormat
                value={num_applicants}
                thousandSeparator={true}
                displayType={"text"}
              />
            </p>
          </div>

          {/* <div
            className={`absolute bottom-0 inset-x-0 bg-red-500 px-4 py-4 sm:px-6`}
          >
            <div className="text-xl md:text-base">
              <p
                className={`capitalize font-semibold text-red-500 text-center`}
              >
                {stage_type} Stage
              </p>
            </div>
          </div> */}
        </dd>
      </div>
    </div>
  );
}
