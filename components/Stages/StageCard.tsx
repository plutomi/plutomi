import React from "react";
import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";
import _ from "lodash";
import router from "next/router";
import { CUSTOM_QUERY } from "../../types/main";

export default function StageCard({
  name,
  stageId,
  totalApplicants,
  linkHref,
  draggable,
}) {
  const urlParams = router.query as Pick<CUSTOM_QUERY, "stageId">;

  if (stageId === urlParams.stageId) {
    console.log("Stage ID match!!");
  }
  const content = (
    <div
      className={`border my-6 shadow-xs py-4 text-center  ${
        !draggable ? " hover:border-blue-500" : "" // Only show blue border on hover on the stage carousel
      } transition ease-in-out duration-300 rounded-xl overflow-hidden ${
        stageId === urlParams.stageId
          ? " bg-sky-50  border border-t-4 border-t-blue-500"
          : " bg-white"
      } ${
        draggable
          ? " shadow-md hover:shadow-lg transition ease-in-out duration-300"
          : ""
      }`}
    >
      <h5 className=" px-2 text-md font-medium text-dark truncate">{name}</h5>

      <dd className="flex items-center  justify-center">
        <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
          <UserGroupIcon className="w-5 h-5 0" />
          <p className="text-md font-semibold ">
            <NumberFormat
              value={totalApplicants}
              thousandSeparator={true}
              displayType={"text"}
            />
          </p>
        </div>
      </dd>
    </div>
  );

  return (
    <Link href={linkHref}>
      <a>{content}</a>
    </Link>
  );
}
