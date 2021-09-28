import React, { useState } from "react";

import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";

export default function StageCard({ name, stage_id }) {
  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/THISOPENINGIDSHOULDBECHANGED/stages/${stage_id}`}
    >
      <a>
        <div className=" border  my-8   py-4 text-center bg-white   shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden">
          <h5 className=" px-2 text-md font-medium text-dark truncate">
            {name}
          </h5>

          <dd className="flex items-center  justify-center">
            <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
              <UserGroupIcon className="w-5 h-5 0" />
              <p className="text-md font-semibold ">
                <NumberFormat
                  value={100}
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
