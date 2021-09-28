import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";

import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";

const items = [
  { id: 1, name: "Waitlist" },
  { id: 2, name: "Questionnaire" },
  { id: 3, name: "Set Up Profile" },
  { id: 4, name: "Driver's License Upload" },
  { id: 5, name: "Insurance Upload" },
  { id: 6, name: "Background Check" },
  { id: 7, name: "Contract Signing" },
  { id: 8, name: "Final Review" },
  { id: 9, name: "Onboarding" },
  { id: 10, name: "Set Up Direct Despoit" },
  { id: 11, name: "Ready to Drive" },
  { id: 12, name: "On Hold" },
  { id: 13, name: "Rejected" },
];

export default function StageCarousel() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const chevronWidth = 60;
  return (
    <div className="mx-auto max-w-7xl py-12 border">
      <ItemsCarousel
      wrapperStyle={"my-24 border border-red-400"}
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={4}
        slidesToScroll={4}
        gutter={20}
        chevronWidth={chevronWidth}
        leftChevron={
          <button className="rounded-full hover:bg-sky-800 px-4 py-2 bg-sky-400 text-white">
            {"<"}
          </button>
        }
        rightChevron={
          <button className="rounded-full px-4 py-2  hover:bg-sky-800 bg-sky-400 text-white">
            {">"}
          </button>
        }
        outsideChevron
        firstAndLastGutter={false}
      >
        {items.map((item) => (
          <Link key={item.id} href={`#${item.id}`}>
            <a className="my-12 border border-red-400">
              <div className=" border  py-4 text-center bg-white   shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden">
                <h5 className=" text-lg font-medium text-dark">{item.name}</h5>

                <dd className="flex items-center  justify-center">
                  <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
                    <UserGroupIcon className="w-5 h-5 0" />
                    <p className="text-xl font-semibold ">
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
        ))}
      </ItemsCarousel>
    </div>
  );
}
