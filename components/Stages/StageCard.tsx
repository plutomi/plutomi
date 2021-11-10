import React from "react";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";
import _ from "lodash";

export default function StageCard({
  name,
  current_stageId,
  openingId,
  total_applicants,
}) {
  const router = useRouter();
  const { stageId } = router.query as CustomQuery;

  return (
    <Link
      href={`${process.env.WEBSITE_URL}/openings/${openingId}/stages/${current_stageId}/applicants`} // TODO should this end with applicants?
    >
      <a>
        <div
          className={`border my-6  py-4 text-center   ${
            stageId === current_stageId
              ? "bg-sky-50 border-t-4 border-t-blue-500 "
              : "bg-white" // Highlighted stage settings
          }  shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden`}
        >
          <h5 className=" px-2 text-md font-medium text-dark truncate">
            {name}
          </h5>

          <dd className="flex items-center  justify-center">
            <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
              <UserGroupIcon className="w-5 h-5 0" />
              <p className="text-md font-semibold ">
                <NumberFormat
                  value={total_applicants}
                  thousandSeparator={true}
                  displayType={"text"}
                />
              </p>
            </div>
          </dd>
        </div>
      </a>
    </Link>
  );
}
