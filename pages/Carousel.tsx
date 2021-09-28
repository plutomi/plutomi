import React, { useState } from "react";
import ItemsCarousel from "react-items-carousel";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/dist/client/link";
import { useRouter } from "next/router";
import { UserGroupIcon } from "@heroicons/react/outline";
import NumberFormat from "react-number-format";

const items = [
  { id: "j2938e", name: "Waitlist" },
  { id: "dn29u", name: "Questionnaire" },
  { id: "ni23", name: "Set Up Profile" },
  { id: "nsicu", name: "Driver's License Upload And checking if things exist" },
  { id: "ndi2", name: "Insurance Upload" },
  { id: "ndo3u2", name: "Background Check" },
  { id: "dno2i", name: "Contract Signing" },
  { id: "m1o", name: "Final Review" },
  { id: "dnou2", name: "Onboarding" },
  { id: "ndu1", name: "Set Up Direct Despoit" },
  { id: "nd1iu3", name: "Ready to Drive" },
  { id: "jd8s0a", name: "On Hold" },
  { id: "n1j", name: "Rejected" },
];

export default function StageCarousel() {
  const router = useRouter();
  const { stage_id } = router.query;
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const chevronWidth = 60;
  return (
    <div className=" max-w-8xl border rounded-xl py-4 mx-24">
      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={6}
        slidesToScroll={3}
        gutter={-60}
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
          <div
            key={item.id}
            className={item.id == (stage_id as string) ? "mx-9" : "mx-9  "}
          >
            <Link
              href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/THISOPENINGIDSHOULDBECHANGED/stages/${item.id}`}
            >
              <a>
                <div className=" border  my-8   py-4 text-center bg-white   shadow-md hover:shadow-xl transition ease-in-out duration-300 rounded-xl overflow-hidden">
                  <h5 className=" px-2 text-md font-medium text-dark truncate">
                    {item.name}
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
          </div>
        ))}
      </ItemsCarousel>
    </div>
  );
}
