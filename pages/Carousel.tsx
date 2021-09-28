import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/dist/client/link";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";

const items = [
  { id: 1, name: "Waitlist" },
  { id: 2, name: "Questionnaire" },
  { id: 3, name: "Set Up Profile" },
  { id: 4, name: "Driver's License Upload And checking if things exist" },
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
    <div className="mx-auto max-w-7xl border rounded-xl py-4">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={4}
        slidesToScroll={4}
        gutter={0}
        chevronWidth={chevronWidth}
        leftChevron={
          <button className="inline-flex  border rounded-l-xl bg-blue-gray-500  hover:bg-blue-gray-800 transition ease-in-out duration-200 w-full justify-center items-center h-full text-white">
            <ArrowLeftIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        rightChevron={
          <button className="inline-flex border rounded-r-xl bg-blue-gray-500 hover:bg-blue-gray-800 transition ease-in-out duration-200 w-full justify-center items-center h-full  text-white">
            <ArrowRightIcon className="h-10 w-10" aria-hidden="true" />
          </button>
        }
        outsideChevron
        firstAndLastGutter={false}
      >
        {items.map((item) => (
          <div key={item.id} className="px-4">
            <Link href={`#${item.id}`}>
              <a>
                <div className=" my-8   py-4 text-center bg-white   shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden">
                  <h5 className="px-8 text-lg font-medium text-dark truncate">
                    {item.name}
                  </h5>

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
          </div>
        ))}
      </ItemsCarousel>
    </div>
  );
}
